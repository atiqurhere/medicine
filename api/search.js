import axios from "axios";
import * as cheerio from "cheerio";

export default async function handler(req, res) {
  const { key } = req.query;
  if (!key) {
    return res.status(400).json({ error: "Missing ?key= parameter" });
  }

  try {
    const url = `https://medex.com.bd/index.php/ajax/search?searchtype=search&searchkey=${encodeURIComponent(key)}`;
    const { data: html } = await axios.get(url);

    const $ = cheerio.load(html);
    const results = [];

    $("a.lsri").each((_, el) => {
      const item = {};
      const link = $(el).attr("href");
      const li = $(el).find("li");
      const type = li.attr("title") || "";
      const img = li.find("img").attr("src") || "";
      const nameSpan = li.find("span").first();
      const strength = nameSpan.find(".sr-strength").text().trim() || "";

      // remove strength span for clean name
      nameSpan.find(".sr-strength").remove();
      const name = nameSpan.text().trim();

      item.link = link.startsWith("http") ? link : `https://medex.com.bd${link}`;
      item.type = type;
      item.image = img.startsWith("http") ? img : `https://medex.com.bd${img}`;
      item.name = name;
      item.strength = strength;

      results.push(item);
    });

    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
