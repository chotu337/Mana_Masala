// ==========================================
// MANA MASALA - ADMIN DASHBOARD
// ==========================================
const SUPABASE_URL = "https://hcczhnmdipqrnbxviuln.supabase.co";
// IMPORTANT:
// Paste your Supabase PUBLISHABLE key here.
// Do NOT use the Resend API key or service_role key.
const SUPABASE_KEY = "sb_publishable_EHoyeiRqm91Y1XIUoLHZvw_37-6eJhI";
let supabaseClient;
// ==========================================
// LOAD SUPABASE
// ==========================================
const script = document.createElement("script");
script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
script.onload = startAdmin;
script.onerror = () => {
    alert("Unable to load Supabase.");
};
document.head.appendChild(script);
// ==========================================
// START ADMIN
// ==========================================
function startAdmin() {
    if (
        SUPABASE_KEY ===
        "sb_publishable_EHoyeiRqm91Y1XIUoLHZvw_37-6eJhI"
    ) {
        alert("Supabase Publishable Key is missing in admin.js");
        return;
    }
    supabaseClient = window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );
    checkSession();
}
// ==========================================
// ELEMENTS
// ==========================================
function $(id) {
    return document.getElementById(id);
}
// ==========================================
// CHECK LOGIN
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
    if ($("loginSection"))
        $("loginSection").style.display = "flex";
    if ($("dashboardSection"))
        $("dashboardSection").style.display = "none";
}
// ==========================================
// SHOW DASHBOARD
// ==========================================
function showDashboard() {
    if ($("loginSection"))
        $("loginSection").style.display = "none";
    if ($("dashboardSection"))
        $("dashboardSection").style.display = "block";
}
// ==========================================
// LOGIN
// ==========================================
async function loginAdmin() {
    const email = $("adminEmail").value.trim();
    const password = $("adminPassword").value;
    if (!email || !password) {
        alert("Enter email and password.");
        return;
    }
    const {
        data,
        error
    } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password
    });
    if (error) {
        console.error("Login error:", error);
        alert("Login failed: " + error.message);
        return;
    }
    showDashboard();
    loadOrders();
}
// ==========================================
// LOAD ORDERS
// ==========================================
async function loadOrders() {
    const tableBody = $("ordersTableBody");
    if (!tableBody) return;
    tableBody.innerHTML =
        `<tr><td colspan="8">Loading orders...</td></tr>`;
    const {
        data: orders,
        error
    } = await supabaseClient
        .from("orders")
        .select("*");
    if (error) {
        console.error("Orders error:", error);
        tableBody.innerHTML =
            `<tr>
                <td colspan="8">
                    Unable to load orders.<br>
                    ${error.message}
                </td>
            </tr>`;
        return;
    }
    if (!orders || orders.length === 0) {
        tableBody.innerHTML =
            `<tr>
                <td colspan="8">
                    No orders found.
                </td>
            </tr>`;
        return;
    }
    tableBody.innerHTML = "";
    orders.forEach(order => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${escapeHTML(order.id)}</td>
            <td>
                ${order.created_at
                    ? new Date(order.created_at).toLocaleString()
                    : "-"}
            </td>
            <td>${escapeHTML(order.customer_name)}</td>
            <td>${escapeHTML(order.customer_phone)}</td>
            <td>${escapeHTML(order.quantity_kg)} kg</td>
            <td>${escapeHTML(order.address)}</td>
            <td>₹${escapeHTML(order.total_amount)}</td>
            <td>
                <select id="status-${escapeHTML(order.id)}">
                    <option value="New"
                        ${order.status === "New" ? "selected" : ""}>
                        New
                    </option>
                    <option value="Processing"
                        ${order.status === "Processing" ? "selected" : ""}>
                        Processing
                    </option>
                    <option value="Completed"
                        ${order.status === "Completed" ? "selected" : ""}>
                        Completed
                    </option>
                    <option value="Cancelled"
                        ${order.status === "Cancelled" ? "selected" : ""}>
                        Cancelled
                    </option>
                </select>
                <button onclick="updateStatus('${order.id}')">
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
    const select = document.getElementById(
        `status-${orderId}`
    );
    if (!select) return;
    const newStatus = select.value;
    const {
        error
    } = await supabaseClient
        .from("orders")
        .update({
            status: newStatus
        })
        .eq("id", orderId);
    if (error) {
        console.error("Update error:", error);
        alert(
            "Unable to update order:\n" +
            error.message
        );
        return;
    }
    alert("Order status updated successfully.");
    loadOrders();
}
// ==========================================
// LOGOUT
// ==========================================
async function logoutAdmin() {
    await supabaseClient.auth.signOut();
    showLogin();
}
// ==========================================
// HTML SAFETY
// ==========================================
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
// ==========================================
// MAKE FUNCTIONS AVAILABLE TO HTML
// ==========================================
window.loginAdmin = loginAdmin;
window.logoutAdmin = logoutAdmin;
window.updateStatus = updateStatus;
