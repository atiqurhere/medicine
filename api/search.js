import axios from "axios";
import * as cheerio from "cheerio";

export default async function handler(req, res) {
  const { key } = req.query;
  if (!key) {
    return res.status(400).json({ error: "Missing ?key= parameter" });
  }

  try {
    const url = `https://medex.com.bd/index.php/ajax/search?searchtype=search&searchkey=${encodeURIComponent(key)}`;

    // ✅ Add browser-like headers to bypass bot detection
    const headers = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
      "Referer": "https://medex.com.bd/",
      "Origin": "https://medex.com.bd",
      "Connection": "keep-alive"
    };

    const { data: html } = await axios.get(url, { headers });

    const $ = cheerio.load(html);
    const results = [];

    $("a.lsri").each((_, el) => {
      const link = $(el).attr("href");
      const li = $(el).find("li");
      const type = li.attr("title") || "";
      const img = li.find("img").attr("src") || "";
      const nameSpan = li.find("span").first();
      const strength = nameSpan.find(".sr-strength").text().trim() || "";
      nameSpan.find(".sr-strength").remove();
      const name = nameSpan.text().trim();

      results.push({
        link: link.startsWith("http") ? link : `https://medex.com.bd${link}`,
        type,
        image: img.startsWith("http") ? img : `https://medex.com.bd${img}`,
        name,
        strength
      });
    });

    res.setHeader("Access-Control-Allow-Origin", "*"); // allow CORS
    res.status(200).json(results);

  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ error: err.message });
  }
}
