import axios from "axios";

export default async function handler(req, res) {
  const { key } = req.query;

  if (!key) {
    return res.status(400).json({ error: "Missing ?key= parameter" });
  }

  try {
    const response = await axios.post(
      "https://api.osudpotro.com/api/v1/home/search_sql",
      { needle: key, page: 0, limit: 20 },
      { headers: { "Content-Type": "application/json" } }
    );

    const data = response.data?.data?.item_data || [];

    const results = data.map((item) => ({
      name: item.item_name,
      type: item.sku_type,
      price: item.sell_price,
      generic: item.generic_or_category_name,
      manufacturer: item.manufacturer_name,
      image: item.images?.[0]?.img
        ? "https://cdn.osudpotro.com/" + item.images[0].img
        : null,
      link: "https://osudpotro.com/product/" + item.alias,
    }));

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json(results);
  } catch (error) {
    console.error("Error fetching data:", error.message);
    res.status(500).json({ error: "Failed to fetch data" });
  }
}
