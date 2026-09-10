/* =========================================================
   MANA MASALA ADMIN DASHBOARD
   SUPABASE AUTH + ORDERS
========================================================= */

const SUPABASE_URL =
    "https://hcczhnmdipqrnbxviuln.supabase.co";

const SUPABASE_KEY =
    "YOUR_EXISTING_SUPABASE_PUBLISHABLE_KEY";


/* =========================================================
   SUPABASE CLIENT
========================================================= */

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


/* =========================================================
   ELEMENTS
========================================================= */

const loginSection =
    document.getElementById("loginSection");

const dashboardSection =
    document.getElementById("dashboardSection");

const loginForm =
    document.getElementById("loginForm");

const adminEmail =
    document.getElementById("adminEmail");

const adminPassword =
    document.getElementById("adminPassword");

const loginButton =
    document.getElementById("loginButton");

const loginMessage =
    document.getElementById("loginMessage");

const logoutButton =
    document.getElementById("logoutButton");

const refreshButton =
    document.getElementById("refreshButton");

const ordersTableBody =
    document.getElementById("ordersTableBody");

const orderCount =
    document.getElementById("orderCount");

const dashboardMessage =
    document.getElementById("dashboardMessage");


/* =========================================================
   LOGIN
========================================================= */

loginForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        const email =
            adminEmail.value.trim();

        const password =
            adminPassword.value;


        loginButton.disabled = true;

        loginButton.textContent =
            "Signing in...";

        loginMessage.textContent = "";


        try {

            const {
                data,
                error
            } =
                await supabaseClient.auth.signInWithPassword({
                    email: email,
                    password: password
                });


            if (error) {
                throw error;
            }


            if (!data.session) {
                throw new Error(
                    "Login session was not created."
                );
            }


            loginMessage.textContent =
                "Login successful.";

            loginMessage.style.color =
                "green";


            showDashboard();

            await loadOrders();


        } catch (error) {

            console.error(
                "Login error:",
                error
            );

            loginMessage.textContent =
                error.message ||
                "Invalid login credentials.";

            loginMessage.style.color =
                "red";

        } finally {

            loginButton.disabled = false;

            loginButton.textContent =
                "Login";
        }
    }
);


/* =========================================================
   SHOW DASHBOARD
========================================================= */

function showDashboard() {

    loginSection.style.display =
        "none";

    dashboardSection.style.display =
        "block";
}


/* =========================================================
   SHOW LOGIN
========================================================= */

function showLogin() {

    dashboardSection.style.display =
        "none";

    loginSection.style.display =
        "flex";
}


/* =========================================================
   LOAD ORDERS
========================================================= */

async function loadOrders() {

    ordersTableBody.innerHTML = `
        <tr>
            <td colspan="9">
                Loading orders...
            </td>
        </tr>
    `;

    dashboardMessage.textContent = "";


    try {

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
            throw error;
        }


        displayOrders(orders || []);


    } catch (error) {

        console.error(
            "Load orders error:",
            error
        );

        ordersTableBody.innerHTML = `
            <tr>
                <td colspan="9">
                    Unable to load orders.
                </td>
            </tr>
        `;

        dashboardMessage.textContent =
            error.message ||
            "Unable to load orders.";

        dashboardMessage.style.color =
            "red";
    }
}


/* =========================================================
   DISPLAY ORDERS
========================================================= */

function displayOrders(orders) {

    orderCount.textContent =
        orders.length +
        (orders.length === 1
            ? " order"
            : " orders");


    if (orders.length === 0) {

        ordersTableBody.innerHTML = `
            <tr>
                <td colspan="9">
                    No orders found.
                </td>
            </tr>
        `;

        return;
    }


    ordersTableBody.innerHTML =
        orders.map(function (order) {

            const date =
                order.created_at
                    ? new Date(
                        order.created_at
                    ).toLocaleString(
                        "en-IN"
                    )
                    : "-";


            const total =
                Number(
                    order.total_amount || 0
                ).toLocaleString(
                    "en-IN"
                );


            const quantity =
                order.quantity_kg || 0;


            const status =
                order.status || "New";


            return `
                <tr>

                    <td>
                        ${escapeHtml(
                            order.id || "-"
                        )}
                    </td>

                    <td>
                        ${escapeHtml(date)}
                    </td>

                    <td>
                        ${escapeHtml(
                            order.customer_name || "-"
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            order.customer_phone || "-"
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            quantity
                        )} kg
                    </td>

                    <td>
                        ${escapeHtml(
                            order.address || "-"
                        )}
                    </td>

                    <td>
                        ₹${escapeHtml(total)}
                    </td>

                    <td>

                        <select
                            class="status-select"
                            data-id="${escapeHtml(
                                order.id
                            )}"
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
                            class="update-button"
                            data-id="${escapeHtml(
                                order.id
                            )}"
                        >
                            Update
                        </button>

                    </td>

                </tr>
            `;

        }).join("");


    attachUpdateButtons();
}


/* =========================================================
   UPDATE BUTTONS
========================================================= */

function attachUpdateButtons() {

    const buttons =
        document.querySelectorAll(
            ".update-button"
        );


    buttons.forEach(function (button) {

        button.addEventListener(
            "click",
            async function () {

                const orderId =
                    button.dataset.id;


                const select =
                    document.querySelector(
                        `.status-select[data-id="${orderId}"]`
                    );


                if (!select) {
                    return;
                }


                const newStatus =
                    select.value;


                button.disabled = true;

                button.textContent =
                    "Saving...";


                try {

                    const {
                        error
                    } =
                        await supabaseClient
                            .from("orders")
                            .update({
                                status: newStatus
                            })
                            .eq(
                                "id",
                                orderId
                            );


                    if (error) {
                        throw error;
                    }


                    button.textContent =
                        "Saved";

                    button.style.color =
                        "green";


                    setTimeout(
                        function () {

                            button.textContent =
                                "Update";

                            button.style.color =
                                "";

                        },
                        1500
                    );


                } catch (error) {

                    console.error(
                        "Update error:",
                        error
                    );

                    alert(
                        "Could not update order: " +
                        error.message
                    );

                    button.textContent =
                        "Update";


                } finally {

                    button.disabled =
                        false;
                }
            }
        );
    });
}


/* =========================================================
   REFRESH
========================================================= */

refreshButton.addEventListener(
    "click",
    async function () {

        refreshButton.disabled =
            true;

        refreshButton.textContent =
            "Refreshing...";


        await loadOrders();


        refreshButton.disabled =
            false;

        refreshButton.textContent =
            "🔄 Refresh";
    }
);


/* =========================================================
   LOGOUT
========================================================= */

logoutButton.addEventListener(
    "click",
    async function () {

        await supabaseClient.auth.signOut();

        showLogin();

        adminPassword.value = "";
    }
);


/* =========================================================
   CHECK EXISTING SESSION
========================================================= */

async function checkSession() {

    const {
        data
    } =
        await supabaseClient.auth.getSession();


    if (data.session) {

        showDashboard();

        await loadOrders();

    } else {

        showLogin();
    }
}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHtml(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


/* =========================================================
   START
========================================================= */

checkSession();
