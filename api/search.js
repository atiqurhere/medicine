import axios from "axios";

async function searchMedicine(needle = "napa") {
  try {
    const res = await axios.post(
      "https://api.osudpotro.com/api/v1/home/search_sql",
      { needle, page: 0, limit: 20 },
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    const items = res.data.data.item_data.map(item => ({
      name: item.item_name,
      type: item.sku_type,
      price: item.sell_price,
      generic: item.generic_or_category_name,
      manufacturer: item.manufacturer_name,
      image: "https://cdn.osudpotro.com/" + item.images[0].img,
      link: "https://osudpotro.com/product/" + item.alias
    }));

    console.log(items);
    return items;
  } catch (err) {
    console.error("Error:", err.message);
  }
}

// Example usage
searchMedicine("brodil");
