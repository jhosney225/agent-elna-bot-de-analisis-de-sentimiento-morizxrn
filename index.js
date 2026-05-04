
```javascript
const Anthropic = require("@anthropic-ai/sdk");
const readline = require("readline");

const client = new Anthropic();

// Sample financial news articles for demonstration
const sampleNews = [
  {
    id: 1,
    headline: "Tech stocks surge as AI investments reach all-time high",
    content:
      "Major technology companies reported strong quarterly earnings today, driven by increased investor interest in artificial intelligence initiatives. Market analysts predict continued growth in the sector.",
  },
  {
    id: 2,
    headline: "Banking sector faces challenges amid rising interest rates",
    content:
      "Financial institutions struggle with net interest margin compression as central banks maintain higher interest rates. Credit defaults are increasing, raising concerns about economic slowdown.",
  },
  {
    id: 3,
    headline: "Green energy stocks rally on new government subsidies",
    content:
      "Renewable energy companies saw significant gains today following announcements of expanded government subsidies. Analysts view this as positive for long-term sector growth and sustainability goals.",
  },
  {
    id: 4,
    headline: "Oil prices plummet as demand weakens globally",
    content:
      "Crude oil prices fell sharply due to reduced global demand and concerns about economic recession. Energy stocks suffered the largest losses in today's trading session.",
  },
  {
    id: 5,
    headline: "E-commerce giant reports record-breaking holiday sales",
    content:
      "A major online retailer announced exceptional Q4 performance, exceeding all expectations. Strong consumer spending and improved logistics efficiency drove the outstanding results.",
  },
];

async function analyzeSentimentWithClaude(newsItem) {
  const prompt = `Analyze the sentiment of the following financial news article and provide a structured response.

Article:
Headline: ${newsItem.headline}
Content: ${newsItem.content}

Please provide:
1. Overall sentiment (positive/negative/neutral)
2. Confidence score (0-100)
3. Key sentiment indicators (list 2-3)
4. Potential market impact (high/medium/low)
5. Brief explanation (1-2 sentences)

Format your response as JSON.`;

  const message = await client.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  // Extract the text content from the response
  const responseText =
    message.content[0].type === "text" ? message.content[0].text : "";

  // Parse JSON from the response
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }

  return {
    sentiment: "unknown",
    confidence: 0,
    error: "Could not parse sentiment analysis",
  };
}

async function generateMarketInsight(sentimentResults) {
  const summaryData = sentimentResults
    .map(
      (result, index) =>
        `Article ${index + 1} (${sampleNews[index].headline}): ${result.sentiment || "unknown"} sentiment with ${result.confidence || 0}% confidence`
    )
    .join("\n");

  const prompt = `Based on the following financial news sentiment analysis results, provide a brief market insight and investment recommendation.

Sentiment Analysis Results:
${summaryData}

Please provide:
1. Overall market sentiment (bullish/bearish/neutral)
2. Key themes and patterns
3. Risk factors to consider
4. Brief investment outlook (2-3 sentences)

Format your response as JSON.`;

  const message = await client.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const responseText =
    message.content[0].type === "text" ? message.content[0].text : "";

  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }

  return { error: "Could not generate market insight" };
}

async function interactiveMode() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (prompt) =>
    new Promise((resolve) => {
      rl.question(prompt, resolve);
    });

  console.log("\n=== Financial News Sentiment Analysis Bot ===");
  console.log(
    "This bot analyzes the sentiment of financial news articles.\n"
  );

  let continueAnalysis = true;

  while (continueAnalysis) {
    console.log("\nOptions:");
    console.log("1. Analyze sentiment of sample news");
    console.log("2. Analyze custom article");
    console.log("3. Get market insight from sample news");
    console.log("4. Exit");

    const choice = await question("\nChoose an option (1-4): ");

    if (choice === "1") {
      console.log("\nAnalyzing sample news articles...\n");

      const sentimentResults = [];

      for (const newsItem of sampleNews) {
        console.log(`Analyzing: "${newsItem.headline}"`);
        const sentiment = await analyzeSentimentWithClaude(newsItem);
        sentimentResults.push(sentiment);
        console.log(`Sentiment: ${sentiment.sentiment || "unknown"}`);
        console.log(
          `Confidence: ${sentiment.confidence || 0}%\n`
        );
      }

      console.log("\n=== Detailed Results ===");
      sentimentResults.forEach((result, index) => {
        console.log(`\nArticle ${index + 1}: ${sampleNews[index].headline}`);
        console.log(JSON.stringify(result, null, 2));
      });
    } else if (choice === "2") {
      const headline = await question