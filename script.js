let categoryChart = null;
let ratingChart = null;
let yearChart = null;


// Load categories
async function loadCategories() {
    try {
        const response = await fetch("/api/categories");

        if (!response.ok) {
            throw new Error("Could not load categories");
        }

        const categories = await response.json();

        const select = document.getElementById("category");

        categories.forEach(category => {
            const option = document.createElement("option");

            option.value = category;
            option.textContent = category;

            select.appendChild(option);
        });

    } catch (error) {
        console.error("Category error:", error);
    }
}


// Load dashboard data
async function loadDashboard() {

    const search =
        document.getElementById("search").value;

    const category =
        document.getElementById("category").value;

    const rating =
        document.getElementById("rating").value;

    const maxPrice =
        document.getElementById("maxPrice").value;


    const params = new URLSearchParams();


    if (search) {
        params.append("search", search);
    }

    if (category && category !== "All") {
        params.append("category", category);
    }

    if (rating) {
        params.append("min_rating", rating);
    }

    if (maxPrice) {
        params.append("max_price", maxPrice);
    }


    try {

        const response =
            await fetch(`/api/dashboard?${params}`);

        if (!response.ok) {
            throw new Error("Dashboard API failed");
        }

        const data = await response.json();

        updateKPIs(data.kpis);

        updateCharts(data);

        updateTopBooks(data.top_books);

        updateBooksTable(data.books);

    } catch (error) {

        console.error(
            "Dashboard error:",
            error
        );

    }
}


// KPI cards
function updateKPIs(kpis) {

    document.getElementById("totalBooks")
        .textContent = kpis.total_books;

    document.getElementById("averageRating")
        .textContent = kpis.average_rating;

    document.getElementById("averagePrice")
        .textContent =
        "$" + Number(kpis.average_price).toFixed(2);

    document.getElementById("categories")
        .textContent = kpis.categories;
}


// Charts
function updateCharts(data) {

    createCategoryChart(data);

    createRatingChart(data);

    createYearChart(data);
}


// Category chart
function createCategoryChart(data) {

    const canvas =
        document.getElementById("categoryChart");

    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    if (categoryChart) {
        categoryChart.destroy();
    }

    categoryChart = new Chart(ctx, {

        type: "doughnut",

        data: {
            labels: data.categories.labels,

            datasets: [{
                data: data.categories.values,

                backgroundColor: [
                    "#6366f1",
                    "#3b82f6",
                    "#10b981",
                    "#f59e0b",
                    "#ef4444",
                    "#8b5cf6",
                    "#ec4899",
                    "#14b8a6",
                    "#f97316",
                    "#06b6d4"
                ],

                borderWidth: 0
            }]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,

            plugins: {
                legend: {
                    position: "right"
                }
            }
        }
    });
}


// Rating chart
function createRatingChart(data) {

    const canvas =
        document.getElementById("ratingChart");

    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    if (ratingChart) {
        ratingChart.destroy();
    }

    ratingChart = new Chart(ctx, {

        type: "bar",

        data: {
            labels: data.ratings.labels,

            datasets: [{
                label: "Number of Books",

                data: data.ratings.values,

                backgroundColor: "#6366f1",

                borderRadius: 6
            }]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,

            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    }
                }
            },

            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}


// Year chart
function createYearChart(data) {

    const canvas =
        document.getElementById("yearChart");

    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    if (yearChart) {
        yearChart.destroy();
    }

    yearChart = new Chart(ctx, {

        type: "line",

        data: {
            labels: data.years.labels,

            datasets: [{
                label: "Books Published",

                data: data.years.values,

                borderColor: "#6366f1",

                backgroundColor:
                    "rgba(99, 102, 241, 0.12)",

                fill: true,

                tension: 0.35,

                pointRadius: 4
            }]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,

            scales: {
                y: {
                    beginAtZero: true,

                    ticks: {
                        precision: 0
                    }
                }
            }
        }
    });
}


// Top books
function updateTopBooks(books) {

    const tbody =
        document.getElementById("topBooksTable");

    if (!tbody) return;

    tbody.innerHTML = "";


    books.forEach((book, index) => {

        const row =
            document.createElement("tr");

        row.innerHTML = `
            <td>${index + 1}</td>

            <td>
                <span class="book-title">
                    ${escapeHTML(book.title)}
                </span>
            </td>

            <td>
                ${escapeHTML(book.author)}
            </td>

            <td>
                <span class="category-badge">
                    ${escapeHTML(book.category)}
                </span>
            </td>

            <td>
                <span class="rating">
                    ⭐ ${book.rating}
                </span>
            </td>

            <td>
                <span class="price">
                    $${Number(book.price).toFixed(2)}
                </span>
            </td>
        `;

        tbody.appendChild(row);
    });
}


// All books
function updateBooksTable(books) {

    const tbody =
        document.getElementById("booksTable");

    if (!tbody) return;

    tbody.innerHTML = "";


    const bookCount =
        document.getElementById("bookCount");

    if (bookCount) {
        bookCount.textContent =
            `${books.length} books`;
    }


    books.forEach(book => {

        const row =
            document.createElement("tr");

        row.innerHTML = `
            <td>
                <span class="book-title">
                    ${escapeHTML(book.title)}
                </span>
            </td>

            <td>
                ${escapeHTML(book.author)}
            </td>

            <td>
                <span class="category-badge">
                    ${escapeHTML(book.category)}
                </span>
            </td>

            <td>
                <span class="rating">
                    ⭐ ${book.rating}
                </span>
            </td>

            <td>
                <span class="price">
                    $${Number(book.price).toFixed(2)}
                </span>
            </td>

            <td>
                ${book.year || "-"}
            </td>
        `;

        tbody.appendChild(row);
    });
}


// Security helper
function escapeHTML(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// Search
document
    .getElementById("search")
    .addEventListener(
        "input",
        debounce(loadDashboard, 300)
    );


// Category
document
    .getElementById("category")
    .addEventListener(
        "change",
        loadDashboard
    );


// Rating
document
    .getElementById("rating")
    .addEventListener(
        "change",
        loadDashboard
    );


// Price
document
    .getElementById("maxPrice")
    .addEventListener(
        "input",
        debounce(loadDashboard, 300)
    );


// Reset
document
    .getElementById("resetBtn")
    .addEventListener(
        "click",
        function () {

            document.getElementById("search").value = "";

            document.getElementById("category").value = "All";

            document.getElementById("rating").value = "";

            document.getElementById("maxPrice").value = "";

            loadDashboard();
        }
    );


// Debounce
function debounce(func, delay) {

    let timer;

    return function () {

        clearTimeout(timer);

        timer = setTimeout(
            func,
            delay
        );
    };
}


// Start dashboard
async function initialize() {

    await loadCategories();

    await loadDashboard();
}

initialize();
