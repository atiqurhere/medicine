import json
import requests

def handler(request):
    query = request.args.get("key", "")
    if not query:
        return {
            "statusCode": 400,
            "body": json.dumps({"error": "Missing ?key= parameter"}),
            "headers": {"Content-Type": "application/json"}
        }

    url = "https://api.osudpotro.com/api/v1/home/search_sql"
    payload = {"needle": query, "page": 0, "limit": 20}
    headers = {"Content-Type": "application/json"}

    try:
        r = requests.post(url, headers=headers, json=payload)
        r.raise_for_status()
        data = r.json()

        if not data.get("status"):
            return {
                "statusCode": 404,
                "body": json.dumps({"error": "No data found"}),
                "headers": {"Content-Type": "application/json"}
            }

        items = data["data"]["item_data"]
        results = []

        for item in items:
            results.append({
                "name": item["item_name"],
                "type": item["sku_type"],
                "price": item["sell_price"],
                "regular_price": item["regular_price"],
                "discount": item["discount"],
                "generic": item["generic_or_category_name"],
                "manufacturer": item["manufacturer_name"],
                "image": f"https://cdn.osudpotro.com/{item['images'][0]['img']}" if item["images"] else None,
                "link": f"https://osudpotro.com/product/{item['alias']}"
            })

        return {
            "statusCode": 200,
            "body": json.dumps(results, ensure_ascii=False, indent=2),
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            }
        }

    except requests.exceptions.RequestException as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)}),
            "headers": {"Content-Type": "application/json"}
        }
