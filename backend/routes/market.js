const express = require('express');
const router = express.Router();
const axios = require('axios');

// Yahoo Finance API for individual stocks (FREE, no key needed)
// Twelve Data for indices (with API Key)

// Helper: Fetch from Yahoo Finance
async function fetchYahooQuote(symbol) {
    // Helper to make request
    const tryFetch = async (s) => {
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${s}?interval=1d&range=1d`;
        const response = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
        });
        return response.data.chart.result[0];
    };

    let result;
    // 1. Try generic or exact symbol if it has a dot
    if (symbol.includes('.')) {
        result = await tryFetch(symbol);
    } else {
        // 2. Try NSE (.NS)
        try {
            result = await tryFetch(`${symbol}.NS`);
        } catch (e) {
            // 3. Fallback to BSE (.BO) if NSE fails
            try {
                result = await tryFetch(`${symbol}.BO`);
            } catch (e2) {
                // throw original error or 'not found'
                throw new Error(`Symbol ${symbol} not found on NSE or BSE`);
            }
        }
    }

    if (!result) throw new Error('No data found');

    const meta = result.meta;
    const quote = result.indicators.quote[0];
    const closes = quote.close || [];
    const currentPrice = meta.regularMarketPrice || closes[closes.length - 1];
    const previousClose = meta.previousClose || meta.chartPreviousClose;

    // Handle cases where data might be incomplete
    if (currentPrice === undefined || previousClose === undefined) {
        throw new Error('Incomplete market data');
    }

    const change = currentPrice - previousClose;
    const changePercent = (change / previousClose) * 100;

    return {
        symbol: symbol.toUpperCase(),
        lastPrice: parseFloat(currentPrice.toFixed(2)),
        change: parseFloat(change.toFixed(2)),
        changePercent: parseFloat(changePercent.toFixed(2)),
        timestamp: new Date().toISOString()
    };
}

// Helper: Fetch from Twelve Data (for indices)
async function fetchTwelveDataQuote(symbol, apiKey) {
    // Ensure properly encoded symbol (e.g., "NIFTY 50" -> "NIFTY%2050")
    // NOTE: Twelve Data requires exact symbol format.
    const encodedSymbol = encodeURIComponent(symbol);

    const response = await axios.get(`https://api.twelvedata.com/quote`, {
        params: {
            symbol: symbol, // axios handles encoding usually, but we'll monitor
            apikey: apiKey
        }
    });

    if (response.data.status === 'error') {
        // Handle Rate Limit specifically
        if (response.data.code === 429) {
            throw new Error('Rate limit exceeded. Try again later.');
        }
        throw new Error(response.data.message);
    }

    const data = response.data;
    return {
        symbol: symbol,
        lastPrice: parseFloat(data.close) || 0,
        change: parseFloat(data.change) || 0,
        changePercent: parseFloat(data.percent_change) || 0,
        timestamp: new Date().toISOString()
    };
}

// GET /quote/:symbol - Fetch single stock/index quote
router.get('/quote/:symbol', async (req, res) => {
    try {
        const { symbol } = req.params;
        const upperSymbol = symbol.toUpperCase().trim();

        // Check if it's an index (use Twelve Data) or stock (use Yahoo)
        const isIndex = ['NIFTY', 'NIFTY 50', 'SENSEX', 'BANK NIFTY', 'BANKNIFTY', 'NIFTY BANK'].includes(upperSymbol);

        let quote;

        if (isIndex) {
            const apiKey = process.env.MARKET_DATA_API_KEY;
            // Fallback to Yahoo for Indices if no key or specific requests
            if (!apiKey) {
                // Try Yahoo for NIFTY/BANKNIFTY as fallback
                if (upperSymbol.includes('NIFTY') || upperSymbol.includes('BANK')) {
                    const mapping = { 'NIFTY': '^NSEI', 'NIFTY 50': '^NSEI', 'BANK NIFTY': '^NSEBANK' };
                    const ySymbol = mapping[upperSymbol] || '^NSEI';
                    quote = await fetchYahooQuote(ySymbol);
                    quote.symbol = upperSymbol; // Restore display name
                } else {
                    return res.status(503).json({ error: 'Market Data API Key not configured' });
                }
            } else {
                // Map to Twelve Data symbol
                let tdSymbol = upperSymbol;
                if (upperSymbol === 'NIFTY') tdSymbol = 'NIFTY 50'; // Auto-correct NIFTY -> NIFTY 50
                if (upperSymbol === 'BANK NIFTY' || upperSymbol === 'BANKNIFTY') tdSymbol = 'NIFTY BANK';

                quote = await fetchTwelveDataQuote(tdSymbol, apiKey);
            }
        } else {
            // Use Yahoo Finance for individual stocks
            quote = await fetchYahooQuote(upperSymbol);
        }

        res.json(quote);

    } catch (error) {
        console.error(`Market Data Error (${req.params.symbol}):`, error.message);

        let status = 502;
        let message = 'Failed to fetch market data';

        if (error.message.includes('not found')) {
            status = 404;
            message = `Symbol '${req.params.symbol}' not found`;
        } else if (error.message.includes('Rate limit')) {
            status = 429;
            message = 'Market data rate limit exceeded';
        }

        res.status(status).json({
            error: message,
            details: error.message
        });
    }
});

// GET /search/:query - Symbol suggestions
router.get('/search/:query', async (req, res) => {
    try {
        const { query } = req.params;
        const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${query}&quotesCount=10&newsCount=0&enableFuzzyQuery=false&quotesQueryId=tss_match_query_v2`;

        const response = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });

        const suggestions = response.data.quotes
            .filter(q => q.quoteType === 'EQUITY' || q.quoteType === 'INDEX')
            .map(q => ({
                symbol: q.symbol.replace('.NS', '').replace('.BO', ''),
                name: q.shortname || q.longname || q.symbol,
                exch: q.exchange,
                type: q.quoteType,
                fullSymbol: q.symbol
            }));

        res.json(suggestions);
    } catch (error) {
        console.error('Search error:', error.message);
        res.status(502).json({ error: 'Failed to fetch suggestions' });
    }
});

// GET /history/:symbol - Fetch historical data for candlestick charts
router.get('/history/:symbol', async (req, res) => {
    try {
        const { symbol } = req.params;
        const upperSymbol = symbol.toUpperCase().trim();

        // NSE/BSE logic
        let querySymbol = upperSymbol;
        if (!upperSymbol.includes('.')) {
            querySymbol = `${upperSymbol}.NS`;
        }

        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${querySymbol}?interval=15m&range=1d`;
        const response = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });

        const result = response.data.chart.result[0];
        if (!result) throw new Error('No historical data found');

        const timestamps = result.timestamp;
        const quotes = result.indicators.quote[0];
        const { open, high, low, close, volume } = quotes;

        const history = timestamps.map((t, i) => ({
            x: new Date(t * 1000),
            y: [
                parseFloat(open[i]?.toFixed(2)),
                parseFloat(high[i]?.toFixed(2)),
                parseFloat(low[i]?.toFixed(2)),
                parseFloat(close[i]?.toFixed(2))
            ]
        })).filter(d => d.y.every(val => val !== null && val !== undefined));

        res.json(history);
    } catch (error) {
        console.error('History error:', error.message);
        res.status(502).json({ error: 'Failed to fetch historical data' });
    }
});

module.exports = router;
