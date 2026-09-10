// ==========================================
// MANA MASALA ADMIN DASHBOARD
// ==========================================
const SUPABASE_URL =
    "https://hcczhnmdipqrnbxviuln.supabase.co";
const SUPABASE_KEY =
    "sb_publishable_EHoyeiRqm91Y1XIUoLHZvw_37-6eJhI";
let supabaseClient = null;
// ==========================================
// LOAD SUPABASE
// ==========================================
function loadSupabase() {
    return new Promise((resolve, reject) => {
        // Already loaded
        if (window.supabase) {
            resolve();
            return;
        }
        const script =
            document.createElement("script");
        script.src =
            "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
        script.onload = resolve;
        script.onerror = () => {
            reject(
                new Error(
                    "Could not load Supabase library."
                )
            );
        };
        document.head.appendChild(script);
    });
}
// ==========================================
// INITIALIZE
// ==========================================
async function initializeAdmin() {
    try {
        if (
            !SUPABASE_KEY ||
            SUPABASE_KEY ===
            "sb_publishable_EHoyeiRqm91Y1XIUoLHZvw_37-6eJhI"
        ) {
            showError(
                "Supabase Publishable Key is missing in admin.js"
            );
            return;
        }
        await loadSupabase();
        supabaseClient =
            window.supabase.createClient(
                SUPABASE_URL,
                SUPABASE_KEY
            );
        console.log(
            "Supabase initialized successfully"
        );
        await checkSession();
    } catch (error) {
        console.error(
            "Initialization error:",
            error
        );
        showError(error.message);
    }
}
// ==========================================
// CHECK SESSION
// ==========================================
async function checkSession() {
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
    if (data.session) {
        showDashboard();
        await loadOrders();
    } else {
        showLogin();
    }
}
// ==========================================
// LOGIN
// ==========================================
async function loginAdmin() {
    const email =
        document
            .getElementById("adminEmail")
            .value
            .trim();
    const password =
        document
            .getElementById("adminPassword")
            .value;
    const message =
        document.getElementById(
            "loginMessage"
        );
    if (!email || !password) {
        message.textContent =
            "Please enter email and password.";
        return;
    }
    message.textContent =
        "Logging in...";
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
        message.textContent =
            error.message;
        return;
    }
    console.log(
        "Login successful:",
        data.user.email
    );
    message.textContent = "";
    showDashboard();
    await loadOrders();
}
// ==========================================
// LOAD ORDERS
// ==========================================
async function loadOrders() {
    const tableBody =
        document.getElementById(
            "ordersTableBody"
        );
    const orderCount =
        document.getElementById(
            "orderCount"
        );
    const dashboardMessage =
        document.getElementById(
            "dashboardMessage"
        );
    if (!tableBody) return;
    tableBody.innerHTML = `
        <tr>
            <td colspan="9">
                Loading orders...
            </td>
        </tr>
    `;
    if (dashboardMessage) {
        dashboardMessage.textContent = "";
    }
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
            "Order loading error:",
            error
        );
        tableBody.innerHTML = `
            <tr>
                <td colspan="9">
                    Unable to load orders.
                    <br><br>
                    ${escapeHTML(error.message)}
                </td>
            </tr>
        `;
        if (orderCount) {
            orderCount.textContent =
                "Error loading orders";
        }
        return;
    }
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
            `${orders.length} order${
                orders.length === 1
                    ? ""
                    : "s"
            }`;
    }
    tableBody.innerHTML = "";
    orders.forEach(order => {
        const row =
            document.createElement("tr");
        const date =
            order.created_at
                ? new Date(
                    order.created_at
                ).toLocaleString()
                : "-";
        const status =
            order.status || "New";
        row.innerHTML = `
            <td>
                ${escapeHTML(order.id)}
            </td>
            <td>
                ${escapeHTML(date)}
            </td>
            <td>
                ${escapeHTML(
                    order.customer_name
                )}
            </td>
            <td>
                ${escapeHTML(
                    order.customer_phone
                )}
            </td>
            <td>
                ${escapeHTML(
                    order.quantity_kg
                )} kg
            </td>
            <td>
                ${escapeHTML(
                    order.address
                )}
            </td>
            <td>
                ₹${escapeHTML(
                    order.total_amount
                )}
            </td>
            <td>
                <select
                    id="status-${escapeHTML(
                        order.id
                    )}"
                >
                    <option
                        value="New"
                        ${
                            status === "New"
                                ? "selected"
                                : ""
                        }
                    >
                        New
                    </option>
                    <option
                        value="Processing"
                        ${
                            status === "Processing"
                                ? "selected"
                                : ""
                        }
                    >
                        Processing
                    </option>
                    <option
                        value="Completed"
                        ${
                            status === "Completed"
                                ? "selected"
                                : ""
                        }
                    >
                        Completed
                    </option>
                    <option
                        value="Cancelled"
                        ${
                            status === "Cancelled"
                                ? "selected"
                                : ""
                        }
                    >
                        Cancelled
                    </option>
                </select>
            </td>
            <td>
                <button
                    onclick="updateStatus('${escapeAttribute(
                        order.id
                    )}')"
                >
                    Update
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}
// ==========================================
// UPDATE STATUS
// ==========================================
async function updateStatus(orderId) {
    const select =
        document.getElementById(
            `status-${orderId}`
        );
    if (!select) {
        alert(
            "Status selector not found."
        );
        return;
    }
    const newStatus =
        select.value;
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
    alert(
        "Order status updated successfully."
    );
    await loadOrders();
}
// ==========================================
// LOGOUT
// ==========================================
async function logoutAdmin() {
    const {
        error
    } =
        await supabaseClient.auth
            .signOut();
    if (error) {
        alert(error.message);
        return;
    }
    showLogin();
}
// ==========================================
// SHOW LOGIN
// ==========================================
function showLogin() {
    document.getElementById(
        "loginSection"
    ).style.display = "flex";
    document.getElementById(
        "dashboardSection"
    ).style.display = "none";
}
// ==========================================
// SHOW DASHBOARD
// ==========================================
function showDashboard() {
    document.getElementById(
        "loginSection"
    ).style.display = "none";
    document.getElementById(
        "dashboardSection"
    ).style.display = "block";
}
// ==========================================
// ERROR
// ==========================================
function showError(message) {
    console.error(message);
    const loginMessage =
        document.getElementById(
            "loginMessage"
        );
    if (loginMessage) {
        loginMessage.textContent =
            message;
        return;
    }
    alert(message);
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
// FORM EVENTS
// ==========================================
document.addEventListener(
    "DOMContentLoaded",
    () => {
        const loginForm =
            document.getElementById(
                "loginForm"
            );
        if (loginForm) {
            loginForm.addEventListener(
                "submit",
                event => {
                    event.preventDefault();
                    loginAdmin();
                }
            );
        }
        const logoutButton =
            document.getElementById(
                "logoutButton"
            );
        if (logoutButton) {
            logoutButton.addEventListener(
                "click",
                logoutAdmin
            );
        }
        const refreshButton =
            document.getElementById(
                "refreshButton"
            );
        if (refreshButton) {
            refreshButton.addEventListener(
                "click",
                loadOrders
            );
        }
        initializeAdmin();
    }
);
