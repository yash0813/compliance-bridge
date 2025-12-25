const express = require('express');
const router = express.Router();
const axios = require('axios');

// Yahoo Finance API for individual stocks (FREE, no key needed)
// Twelve Data for indices (with API Key)

// Helper: Fetch from Yahoo Finance
async function fetchYahooQuote(symbol) {
    // For Indian stocks, Yahoo uses .NS suffix for NSE
    const yahooSymbol = symbol.includes('.') ? symbol : `${symbol}.NS`;

    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?interval=1d&range=1d`;

    const response = await axios.get(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
    });

    const result = response.data.chart.result[0];
    const meta = result.meta;
    const quote = result.indicators.quote[0];

    const currentPrice = meta.regularMarketPrice || quote.close[quote.close.length - 1];
    const previousClose = meta.previousClose || meta.chartPreviousClose;
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
    const response = await axios.get(`https://api.twelvedata.com/quote`, {
        params: {
            symbol: symbol,
            apikey: apiKey
        }
    });

    if (response.data.status === 'error') {
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
            if (!apiKey) {
                return res.status(503).json({ error: 'Market Data API Key not configured for indices' });
            }

            // Map to Twelve Data symbol
            let tdSymbol = upperSymbol;
            if (upperSymbol === 'NIFTY' || upperSymbol === 'NIFTY 50') tdSymbol = 'NIFTY 50';
            if (upperSymbol === 'BANK NIFTY' || upperSymbol === 'BANKNIFTY') tdSymbol = 'NIFTY BANK';

            quote = await fetchTwelveDataQuote(tdSymbol, apiKey);
        } else {
            // Use Yahoo Finance for individual stocks
            quote = await fetchYahooQuote(upperSymbol);
        }

        res.json(quote);

    } catch (error) {
        console.error('Market Data API Error:', error.message);
        res.status(502).json({
            error: 'Failed to fetch market data',
            details: error.message
        });
    }
});

// GET /indices - Batch fetch for header indices
router.get('/indices', async (req, res) => {
    try {
        const apiKey = process.env.MARKET_DATA_API_KEY;

        if (!apiKey) {
            // Return mock data if no key
            return res.json([
                { symbol: 'NIFTY 50', lastPrice: 22000, change: 100, changePercent: 0.45, timestamp: new Date().toISOString() },
                { symbol: 'SENSEX', lastPrice: 72000, change: 200, changePercent: 0.28, timestamp: new Date().toISOString() },
                { symbol: 'BANK NIFTY', lastPrice: 47000, change: -50, changePercent: -0.11, timestamp: new Date().toISOString() }
            ]);
        }

        // Twelve Data batch request for indices
        const symbols = 'NIFTY 50,SENSEX';
        const response = await axios.get(`https://api.twelvedata.com/quote`, {
            params: {
                symbol: symbols,
                apikey: apiKey,
            }
        });

        const result = [];

        const parse = (data, name) => ({
            symbol: name,
            lastPrice: parseFloat(data.close) || 0,
            change: parseFloat(data.change) || 0,
            changePercent: parseFloat(data.percent_change) || 0,
            timestamp: new Date().toISOString()
        });

        if (response.data['NIFTY 50']) result.push(parse(response.data['NIFTY 50'], 'NIFTY 50'));
        if (response.data.SENSEX) result.push(parse(response.data.SENSEX, 'SENSEX'));

        // Fetch Bank Nifty from Yahoo (Twelve Data free tier may not support it)
        try {
            const bankNifty = await fetchYahooQuote('^NSEBANK');
            bankNifty.symbol = 'BANK NIFTY';
            result.push(bankNifty);
        } catch (e) {
            // Fallback for Bank Nifty
            result.push({ symbol: 'BANK NIFTY', lastPrice: 47000, change: 0, changePercent: 0, timestamp: new Date().toISOString() });
        }

        res.json(result);

    } catch (error) {
        console.error('Market Indices Error:', error.message);
        res.status(502).json({ error: 'Failed to fetch indices' });
    }
});

module.exports = router;
