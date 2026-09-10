// ==========================================
// MANA MASALA - ADMIN DASHBOARD
// ==========================================
// Supabase project
const SUPABASE_URL =
    "https://hcczhnmdipqrnbxviuln.supabase.co";
// Supabase Publishable Key
const SUPABASE_KEY =
    "sb_publishable_EHoyeiRqm91Y1XIUoLHZvw_37-6eJhI";
// ==========================================
// SUPABASE CLIENT
// ==========================================
const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );
console.log("Supabase client initialized");
// ==========================================
// GET HTML ELEMENT
// ==========================================
function $(id) {
    return document.getElementById(id);
}
// ==========================================
// CHECK LOGIN SESSION
// ==========================================
async function checkSession() {
    const {
        data,
        error
    } = await supabaseClient.auth.getSession();
    if (error) {
        console.error("Session error:", error);
        showLogin();
        return;
    }
    if (data.session) {
        showDashboard();
        loadOrders();
    } else {
        showLogin();
    }
}
// ==========================================
// SHOW LOGIN
// ==========================================
function showLogin() {
    if ($("loginSection")) {
        $("loginSection").style.display = "flex";
    }
    if ($("dashboardSection")) {
        $("dashboardSection").style.display = "none";
    }
}
// ==========================================
// SHOW DASHBOARD
// ==========================================
function showDashboard() {
    if ($("loginSection")) {
        $("loginSection").style.display = "none";
    }
    if ($("dashboardSection")) {
        $("dashboardSection").style.display = "block";
    }
}
// ==========================================
// ADMIN LOGIN
// ==========================================
async function loginAdmin() {
    const emailElement = $("adminEmail");
    const passwordElement = $("adminPassword");
    if (!emailElement || !passwordElement) {
        alert("Login fields not found.");
        return;
    }
    const email = emailElement.value.trim();
    const password = passwordElement.value;
    if (!email || !password) {
        alert("Please enter your email and password.");
        return;
    }
    console.log("Attempting admin login...");
    const {
        data,
        error
    } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password
    });
    if (error) {
        console.error("Login error:", error);
        alert(
            "Login failed:\n\n" +
            error.message
        );
        return;
    }
    console.log("Admin login successful:", data.user);
    showDashboard();
    loadOrders();
}
// ==========================================
// LOAD ORDERS
// ==========================================
async function loadOrders() {
    const tableBody = $("ordersTableBody");
    if (!tableBody) {
        console.error("ordersTableBody not found.");
        return;
    }
    tableBody.innerHTML = `
        <tr>
            <td colspan="8">
                Loading orders...
            </td>
        </tr>
    `;
    console.log("Loading orders...");
    const {
        data: orders,
        error
    } = await supabaseClient
        .from("orders")
        .select("*")
        .order("created_at", {
            ascending: false
        });
    if (error) {
        console.error("Orders loading error:", error);
        tableBody.innerHTML = `
            <tr>
                <td colspan="8">
                    Unable to load orders.<br><br>
                    ${escapeHTML(error.message)}
                </td>
            </tr>
        `;
        return;
    }
    console.log("Orders received:", orders);
    if (!orders || orders.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="8">
                    No orders found.
                </td>
            </tr>
        `;
        return;
    }
    tableBody.innerHTML = "";
    orders.forEach(order => {
        const row = document.createElement("tr");
        const orderId =
            order.id !== null && order.id !== undefined
                ? order.id
                : "";
        const customerName =
            order.customer_name || "";
        const phone =
            order.customer_phone || "";
        const quantity =
            order.quantity_kg || 0;
        const address =
            order.address || "";
        const total =
            order.total_amount || 0;
        const status =
            order.status || "New";
        const createdAt =
            order.created_at
                ? new Date(order.created_at).toLocaleString()
                : "-";
        row.innerHTML = `
            <td>
                ${escapeHTML(orderId)}
            </td>
            <td>
                ${escapeHTML(createdAt)}
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
                    <option value="New"
                        ${status === "New" ? "selected" : ""}>
                        New
                    </option>
                    <option value="Processing"
                        ${status === "Processing" ? "selected" : ""}>
                        Processing
                    </option>
                    <option value="Completed"
                        ${status === "Completed" ? "selected" : ""}>
                        Completed
                    </option>
                    <option value="Cancelled"
                        ${status === "Cancelled" ? "selected" : ""}>
                        Cancelled
                    </option>
                </select>
                <button
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
    const select =
        document.getElementById(
            `status-${orderId}`
        );
    if (!select) {
        alert("Status selector not found.");
        return;
    }
    const newStatus = select.value;
    console.log(
        "Updating order:",
        orderId,
        newStatus
    );
    const {
        error
    } = await supabaseClient
        .from("orders")
        .update({
            status: newStatus
        })
        .eq("id", orderId);
    if (error) {
        console.error(
            "Status update error:",
            error
        );
        alert(
            "Unable to update order:\n\n" +
            error.message
        );
        return;
    }
    alert(
        "Order status updated successfully."
    );
    loadOrders();
}
// ==========================================
// LOGOUT
// ==========================================
async function logoutAdmin() {
    const {
        error
    } = await supabaseClient.auth.signOut();
    if (error) {
        console.error(
            "Logout error:",
            error
        );
        alert(error.message);
        return;
    }
    showLogin();
}
// ==========================================
// HTML SAFETY
// ==========================================
function escapeHTML(value) {
    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
function escapeAttribute(value) {
    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }
    return String(value)
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'");
}
// ==========================================
// MAKE FUNCTIONS AVAILABLE TO HTML
// ==========================================
window.loginAdmin = loginAdmin;
window.logoutAdmin = logoutAdmin;
window.updateStatus = updateStatus;
// ==========================================
// START
// ==========================================
checkSession();
