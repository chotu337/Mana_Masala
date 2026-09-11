// ==========================================
// 🌶️ MANA MASALA - ADMIN DASHBOARD
// ==========================================

// ==========================================
// SUPABASE CONFIGURATION
// ==========================================

const SUPABASE_URL =
    "https://hcczhnmdipqrnbxviuln.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_EHoyeiRqm91Y1XIUoLHZvw_37-6eJhI";

// ==========================================
// CREATE SUPABASE CLIENT
// ==========================================

let supabaseClient = null;

function initializeSupabase() {

    if (!window.supabase) {
        console.error("Supabase library not loaded.");
        showLoginMessage(
            "Supabase library could not be loaded."
        );
        return false;
    }

    try {

        supabaseClient =
            window.supabase.createClient(
                SUPABASE_URL,
                SUPABASE_KEY
            );

        console.log(
            "✅ Supabase client initialized"
        );

        return true;

    } catch (error) {

        console.error(
            "Supabase initialization error:",
            error
        );

        showLoginMessage(
            "Supabase initialization failed."
        );

        return false;
    }
}

// ==========================================
// ELEMENT HELPER
// ==========================================

function getElement(id) {
    return document.getElementById(id);
}

// ==========================================
// LOGIN MESSAGE
// ==========================================

function showLoginMessage(message) {

    const element =
        getElement("loginMessage");

    if (element) {
        element.textContent = message;
    }
}

// ==========================================
// DASHBOARD MESSAGE
// ==========================================

function showDashboardMessage(message) {

    const element =
        getElement("dashboardMessage");

    if (element) {
        element.textContent = message;
    }
}

// ==========================================
// SHOW LOGIN
// ==========================================

function showLogin() {

    const loginSection =
        getElement("loginSection");

    const dashboardSection =
        getElement("dashboardSection");

    if (loginSection) {
        loginSection.style.display = "flex";
    }

    if (dashboardSection) {
        dashboardSection.style.display = "none";
    }
}

// ==========================================
// SHOW DASHBOARD
// ==========================================

function showDashboard() {

    const loginSection =
        getElement("loginSection");

    const dashboardSection =
        getElement("dashboardSection");

    if (loginSection) {
        loginSection.style.display = "none";
    }

    if (dashboardSection) {
        dashboardSection.style.display = "block";
    }
}

// ==========================================
// CHECK CURRENT LOGIN
// ==========================================

async function checkSession() {

    if (!supabaseClient) {
        return;
    }

    console.log(
        "Checking admin session..."
    );

    const {
        data,
        error
    } =
        await supabaseClient.auth.getSession();

    if (error) {

        console.error(
            "Session error:",
            error
        );

        showLogin();

        return;
    }

    if (data && data.session) {

        console.log(
            "✅ Admin session found"
        );

        showDashboard();

        await loadOrders();

    } else {

        console.log(
            "No admin session found"
        );

        showLogin();
    }
}

// ==========================================
// ADMIN LOGIN
// ==========================================

async function loginAdmin() {

    if (!supabaseClient) {

        showLoginMessage(
            "Supabase is not initialized."
        );

        return;
    }

    const emailInput =
        getElement("adminEmail");

    const passwordInput =
        getElement("adminPassword");

    const loginButton =
        getElement("loginButton");

    if (!emailInput || !passwordInput) {

        console.error(
            "Login fields not found."
        );

        return;
    }

    const email =
        emailInput.value.trim();

    const password =
        passwordInput.value;

    if (!email || !password) {

        showLoginMessage(
            "Please enter email and password."
        );

        return;
    }

    showLoginMessage(
        "Logging in..."
    );

    if (loginButton) {
        loginButton.disabled = true;
        loginButton.textContent =
            "Logging in...";
    }

    console.log(
        "Attempting Supabase login..."
    );

    const {
        data,
        error
    } =
        await supabaseClient.auth
            .signInWithPassword({
                email: email,
                password: password
            });

    if (error) {

        console.error(
            "Login error:",
            error
        );

        showLoginMessage(
            "Login failed: " +
            error.message
        );

        if (loginButton) {
            loginButton.disabled = false;
            loginButton.textContent =
                "Login";
        }

        return;
    }

    console.log(
        "✅ Admin login successful"
    );

    showLoginMessage("");

    if (loginButton) {
        loginButton.disabled = false;
        loginButton.textContent =
            "Login";
    }

    showDashboard();

    await loadOrders();
}

// ==========================================
// LOAD ORDERS
// ==========================================

async function loadOrders() {

    if (!supabaseClient) {
        return;
    }

    const tableBody =
        getElement("ordersTableBody");

    const orderCount =
        getElement("orderCount");

    if (!tableBody) {

        console.error(
            "ordersTableBody not found."
        );

        return;
    }

    tableBody.innerHTML = `
        <tr>
            <td colspan="9">
                Loading orders...
            </td>
        </tr>
    `;

    if (orderCount) {
        orderCount.textContent =
            "Loading orders...";
    }

    console.log(
        "Loading orders from Supabase..."
    );

    const {
        data: orders,
        error
    } =
        await supabaseClient
            .from("orders")
            .select("*")
            .order(
                "created_at",
                {
                    ascending: false
                }
            );

    if (error) {

        console.error(
            "❌ Orders error:",
            error
        );

        tableBody.innerHTML = `
            <tr>
                <td colspan="9">
                    Unable to load orders.
                    <br><br>
                    ${escapeHTML(
                        error.message
                    )}
                </td>
            </tr>
        `;

        if (orderCount) {
            orderCount.textContent =
                "Error loading orders";
        }

        return;
    }

    console.log(
        "✅ Orders loaded:",
        orders
    );

    if (!orders || orders.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="9">
                    No orders found.
                </td>
            </tr>
        `;

        if (orderCount) {
            orderCount.textContent =
                "0 orders";
        }

        return;
    }

    if (orderCount) {

        orderCount.textContent =
            orders.length +
            (orders.length === 1
                ? " order"
                : " orders");
    }

    tableBody.innerHTML = "";

    orders.forEach(order => {

        const row =
            document.createElement("tr");

        const orderId =
            order.id ?? "";

        const customerName =
            order.customer_name ?? "";

        const phone =
            order.customer_phone ?? "";

        const quantity =
            order.quantity_kg ?? "";

        const address =
            order.address ?? "";

        const total =
            order.total_amount ?? "";

        const status =
            order.status || "New";

        let date = "-";

        if (order.created_at) {

            date =
                new Date(
                    order.created_at
                ).toLocaleString(
                    "en-IN"
                );
        }

        row.innerHTML = `

            <td>
                ${escapeHTML(orderId)}
            </td>

            <td>
                ${escapeHTML(date)}
            </td>

            <td>
                ${escapeHTML(customerName)}
            </td>

            <td>
                ${escapeHTML(phone)}
            </td>

            <td>
                ${escapeHTML(quantity)} kg
            </td>

            <td>
                ${escapeHTML(address)}
            </td>

            <td>
                ₹${escapeHTML(total)}
            </td>

            <td>

                <select
                    id="status-${escapeHTML(orderId)}"
                >

                    <option
                        value="New"
                        ${status === "New"
                            ? "selected"
                            : ""}
                    >
                        New
                    </option>

                    <option
                        value="Processing"
                        ${status === "Processing"
                            ? "selected"
                            : ""}
                    >
                        Processing
                    </option>

                    <option
                        value="Completed"
                        ${status === "Completed"
                            ? "selected"
                            : ""}
                    >
                        Completed
                    </option>

                    <option
                        value="Cancelled"
                        ${status === "Cancelled"
                            ? "selected"
                            : ""}
                    >
                        Cancelled
                    </option>

                </select>

            </td>

            <td>

                <button
                    type="button"
                    onclick="updateStatus('${escapeAttribute(orderId)}')"
                >
                    Update
                </button>

            </td>
        `;

        tableBody.appendChild(row);
    });
}

// ==========================================
// UPDATE ORDER STATUS
// ==========================================

async function updateStatus(orderId) {

    if (!supabaseClient) {

        alert(
            "Supabase is not initialized."
        );

        return;
    }

    const select =
        getElement(
            "status-" + orderId
        );

    if (!select) {

        alert(
            "Status selector not found."
        );

        return;
    }

    const newStatus =
        select.value;

    console.log(
        "Updating order:",
        orderId,
        newStatus
    );

    const {
        error
    } =
        await supabaseClient
            .from("orders")
            .update({
                status: newStatus
            })
            .eq("id", orderId);

    if (error) {

        console.error(
            "Update error:",
            error
        );

        alert(
            "Unable to update order:\n\n" +
            error.message
        );

        return;
    }

    console.log(
        "✅ Order status updated"
    );

    alert(
        "Order status updated successfully."
    );

    await loadOrders();
}

// ==========================================
// LOGOUT
// ==========================================

async function logoutAdmin() {

    if (!supabaseClient) {
        return;
    }

    const {
        error
    } =
        await supabaseClient.auth.signOut();

    if (error) {

        console.error(
            "Logout error:",
            error
        );

        alert(error.message);

        return;
    }

    console.log(
        "Admin logged out"
    );

    showLogin();
}

// ==========================================
// HTML SECURITY
// ==========================================

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}

function escapeAttribute(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value)
        .replace(
            /\\/g,
            "\\\\"
        )
        .replace(
            /'/g,
            "\\'"
        );
}

// ==========================================
// PAGE START
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        console.log(
            "🌶️ Mana Masala Admin starting..."
        );

        // Login form
        const loginForm =
            getElement("loginForm");

        if (loginForm) {

            loginForm.addEventListener(
                "submit",
                function (event) {

                    event.preventDefault();

                    loginAdmin();
                }
            );
        }

        // Logout button
        const logoutButton =
            getElement("logoutButton");

        if (logoutButton) {

            logoutButton.addEventListener(
                "click",
                logoutAdmin
            );
        }

        // Refresh button
        const refreshButton =
            getElement("refreshButton");

        if (refreshButton) {

            refreshButton.addEventListener(
                "click",
                loadOrders
            );
        }

        // Initialize Supabase
        const initialized =
            initializeSupabase();

        if (!initialized) {
            return;
        }

        // Check existing session
        await checkSession();
    }
);
