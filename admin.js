// =========================================
// MANA MASALA - ADMIN DASHBOARD
// =========================================

// Supabase project
const SUPABASE_URL =
    "https://hcczhnmdipqrnbxviuln.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_EHoyeiRqm91Y1XIUoLHZvw_37-6eJhI";

// Create Supabase client
const supabaseClient =
    supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


// =========================================
// HTML ELEMENTS
// =========================================

const loginSection =
    document.getElementById("loginSection");

const dashboardSection =
    document.getElementById("dashboardSection");

const emailInput =
    document.getElementById("email");

const passwordInput =
    document.getElementById("password");

const loginButton =
    document.getElementById("loginButton");

const loginMessage =
    document.getElementById("loginMessage");

const logoutButton =
    document.getElementById("logoutButton");

const ordersTable =
    document.getElementById("ordersTable");

const totalOrders =
    document.getElementById("totalOrders");

const totalQuantity =
    document.getElementById("totalQuantity");

const totalSales =
    document.getElementById("totalSales");


// =========================================
// ESCAPE HTML
// Prevent customer input from becoming HTML
// =========================================

function escapeHtml(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// =========================================
// SHOW LOGIN
// =========================================

function showLogin() {

    loginSection.style.display = "block";

    dashboardSection.style.display = "none";

}


// =========================================
// SHOW DASHBOARD
// =========================================

function showDashboard() {

    loginSection.style.display = "none";

    dashboardSection.style.display = "block";

}


// =========================================
// LOGIN
// =========================================

loginButton.addEventListener("click", async function () {

    const email =
        emailInput.value.trim();

    const password =
        passwordInput.value;

    loginMessage.textContent = "";

    if (!email || !password) {

        loginMessage.textContent =
            "Please enter email and password.";

        loginMessage.style.color = "red";

        return;
    }


    loginButton.disabled = true;

    loginButton.textContent = "Logging in...";


    try {

        const { data, error } =
            await supabaseClient.auth.signInWithPassword({

                email: email,

                password: password

            });


        if (error) {

            throw error;

        }


        if (!data.session) {

            throw new Error(
                "Login failed. Please try again."
            );

        }


        loginMessage.textContent =
            "Login successful!";

        loginMessage.style.color = "green";


        showDashboard();

        await loadOrders();


    } catch (error) {

        console.error("Login error:", error);

        loginMessage.textContent =
            error.message || "Login failed.";

        loginMessage.style.color = "red";

    } finally {

        loginButton.disabled = false;

        loginButton.textContent = "Login";

    }

});


// =========================================
// LOAD ORDERS
// =========================================

async function loadOrders() {

    ordersTable.innerHTML = `
        <tr>
            <td colspan="7" class="empty">
                Loading orders...
            </td>
        </tr>
    `;


    try {

        const { data: orders, error } =
            await supabaseClient
                .from("orders")
                .select("*")
                .order("created_at", {
                    ascending: false
                });


        if (error) {

            throw error;

        }


        // =====================================
        // NO ORDERS
        // =====================================

        if (!orders || orders.length === 0) {

            totalOrders.textContent = "0";

            totalQuantity.textContent = "0 kg";

            totalSales.textContent = "₹0";


            ordersTable.innerHTML = `
                <tr>
                    <td colspan="7" class="empty">
                        No customer orders yet.
                    </td>
                </tr>
            `;

            return;

        }


        // =====================================
        // CALCULATE STATISTICS
        // =====================================

        const orderCount =
            orders.length;


        const quantity =
            orders.reduce(
                function (sum, order) {

                    return sum +
                        Number(order.quantity_kg || 0);

                },
                0
            );


        const sales =
            orders.reduce(
                function (sum, order) {

                    return sum +
                        Number(order.total_amount || 0);

                },
                0
            );


        totalOrders.textContent =
            orderCount;


        totalQuantity.textContent =
            quantity + " kg";


        totalSales.textContent =
            "₹" + sales.toLocaleString("en-IN");


        // =====================================
        // DISPLAY ORDERS
        // =====================================

        ordersTable.innerHTML =
            orders.map(function (order) {

                const date =
                    order.created_at
                        ? new Date(
                            order.created_at
                        ).toLocaleString("en-IN")
                        : "-";


                return `
                    <tr>

                        <td>
                            ${escapeHtml(order.customer_name)}
                        </td>

                        <td>
                            ${escapeHtml(order.customer_phone)}
                        </td>

                        <td>
                            ${escapeHtml(order.quantity_kg)} kg
                        </td>

                        <td>
                            ${escapeHtml(order.address)}
                        </td>

                        <td>
                            ₹${Number(
                                order.total_amount || 0
                            ).toLocaleString("en-IN")}
                        </td>

                        <td>
                            <span class="status">
                                ${escapeHtml(order.status || "New")}
                            </span>
                        </td>

                        <td>
                            ${escapeHtml(date)}
                        </td>

                    </tr>
                `;

            }).join("");


    } catch (error) {

        console.error(
            "Load orders error:",
            error
        );


        ordersTable.innerHTML = `
            <tr>
                <td colspan="7" class="empty">
                    Unable to load orders.
                    <br>
                    ${escapeHtml(error.message)}
                </td>
            </tr>
        `;

    }

}


// =========================================
// LOGOUT
// =========================================

logoutButton.addEventListener(
    "click",
    async function () {

        await supabaseClient.auth.signOut();

        showLogin();

        emailInput.value = "";

        passwordInput.value = "";

        loginMessage.textContent = "";

    }
);


// =========================================
// CHECK EXISTING LOGIN SESSION
// =========================================

async function checkSession() {

    try {

        const { data, error } =
            await supabaseClient.auth.getSession();


        if (error) {

            throw error;

        }


        if (data.session) {

            showDashboard();

            await loadOrders();

        } else {

            showLogin();

        }


    } catch (error) {

        console.error(
            "Session error:",
            error
        );

        showLogin();

    }

}


// =========================================
// START ADMIN PAGE
// =========================================

checkSession();