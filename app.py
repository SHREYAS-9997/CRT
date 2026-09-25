from flask import Flask, render_template, jsonify, request
import pandas as pd

app = Flask(__name__)

DATA_FILE = "books.csv"


def load_data():
    df = pd.read_csv(DATA_FILE)

    df["rating"] = pd.to_numeric(df["rating"], errors="coerce")
    df["price"] = pd.to_numeric(df["price"], errors="coerce")
    df["year"] = pd.to_numeric(df["year"], errors="coerce")

    df = df.dropna(subset=["title", "author", "category"])

    return df


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/dashboard")
def dashboard():

    df = load_data()

    # Query parameters
    search = request.args.get("search", "").strip().lower()
    category = request.args.get("category", "All")
    min_rating = request.args.get("min_rating", "")
    max_price = request.args.get("max_price", "")

    # Search
    if search:
        df = df[
            df["title"].str.lower().str.contains(search, na=False)
            | df["author"].str.lower().str.contains(search, na=False)
        ]

    # Category
    if category and category != "All":
        df = df[df["category"] == category]

    # Minimum rating
    if min_rating:
        try:
            df = df[df["rating"] >= float(min_rating)]
        except ValueError:
            pass

    # Maximum price
    if max_price:
        try:
            df = df[df["price"] <= float(max_price)]
        except ValueError:
            pass

    # KPI calculations
    total_books = len(df)

    average_rating = round(
        df["rating"].mean(), 2
    ) if total_books else 0

    average_price = round(
        df["price"].mean(), 2
    ) if total_books else 0

    categories_count = df["category"].nunique()

    # Category analysis
    category_data = (
        df.groupby("category")
        .size()
        .sort_values(ascending=False)
    )

    # Rating distribution
    rating_distribution = (
        df.groupby("rating")
        .size()
        .sort_index()
    )

    # Year analysis
    year_data = (
        df.groupby("year")
        .size()
        .sort_index()
    )

    # Top-rated books
    top_books = (
        df.sort_values(
            by=["rating", "title"],
            ascending=[False, True]
        )
        .head(10)
    )

    # Table data
    books = df.sort_values("title").to_dict(orient="records")

    response = {
        "kpis": {
            "total_books": total_books,
            "average_rating": average_rating,
            "average_price": average_price,
            "categories": categories_count
        },

        "categories": {
            "labels": category_data.index.tolist(),
            "values": category_data.values.tolist()
        },

        "ratings": {
            "labels": [str(x) for x in rating_distribution.index.tolist()],
            "values": rating_distribution.values.tolist()
        },

        "years": {
            "labels": [
                str(int(x)) for x in year_data.index.tolist()
            ],
            "values": year_data.values.tolist()
        },

        "top_books": top_books[
            ["title", "author", "category", "rating", "price"]
        ].to_dict(orient="records"),

        "books": books
    }

    return jsonify(response)


@app.route("/api/categories")
def categories():

    df = load_data()

    categories = sorted(
        df["category"].dropna().unique().tolist()
    )

    return jsonify(categories)


if __name__ == "__main__":
    app.run(debug=True)
