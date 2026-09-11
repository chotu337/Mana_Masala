/* =========================================================
   MANA MASALA - CUSTOMER ORDER SCRIPT
   ========================================================= */

const SUPABASE_URL = "https://hcczhnmdipqrnbxviuln.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_EHoyeiRqm91Y1XIUoLHZvw_37-6eJhI";

const EDGE_FUNCTION_NAME = "new-order-notification";

const PRICE_PER_KG = 400;
const MINIMUM_ORDER = 10;


/* =========================================================
   LOAD SUPABASE
   ========================================================= */

function loadSupabase() {
    return new Promise((resolve, reject) => {

        if (window.supabase) {
            resolve();
            return;
        }

        const script = document.createElement("script");

        script.src =
            "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";

        script.onload = () => {
            resolve();
        };

        script.onerror = () => {
            reject(
                new Error("Unable to load Supabase library.")
            );
        };

        document.head.appendChild(script);
    });
}


/* =========================================================
   INITIALIZE
   ========================================================= */

async function initializeManaMasala() {

    try {

        await loadSupabase();

        if (!window.supabase) {
            throw new Error("Supabase library not available.");
        }

        window.manaSupabase =
            window.supabase.createClient(
                SUPABASE_URL,
                SUPABASE_KEY
            );

        console.log("Mana Masala Supabase connected.");

        setupOrderSystem();

    } catch (error) {

        console.error(
            "Supabase initialization error:",
            error
        );

        const message =
            document.getElementById("orderMessage");

        if (message) {
            message.textContent =
                "Website connection problem. Please refresh and try again.";

            message.className = "error";
        }
    }
}


/* =========================================================
   ORDER SYSTEM
   ========================================================= */

function setupOrderSystem() {

    const nameInput =
        document.getElementById("customerName");

    const phoneInput =
        document.getElementById("customerPhone");

    const addressInput =
        document.getElementById("address");

    const quantityInput =
        document.getElementById("quantity");

    const placeOrderButton =
        document.getElementById("placeOrderButton");

    const orderMessage =
        document.getElementById("orderMessage");

    const totalElement =
        document.getElementById("totalAmount");


    if (
        !nameInput ||
        !phoneInput ||
        !addressInput ||
        !quantityInput ||
        !placeOrderButton
    ) {

        console.error(
            "Order form elements not found."
        );

        return;
    }


    /* =====================================================
       UPDATE TOTAL
       ===================================================== */

    function updateTotal() {

        let quantity =
            parseInt(quantityInput.value, 10);

        if (isNaN(quantity)) {
            quantity = MINIMUM_ORDER;
        }

        if (quantity < MINIMUM_ORDER) {
            quantity = MINIMUM_ORDER;
        }

        const total =
            quantity * PRICE_PER_KG;

        if (totalElement) {
            totalElement.textContent =
                "₹" + total.toLocaleString("en-IN");
        }

        return {
            quantity,
            total
        };
    }


    /* =====================================================
       QUANTITY CHANGE
       ===================================================== */

    quantityInput.addEventListener(
        "input",
        updateTotal
    );


    quantityInput.addEventListener(
        "change",
        updateTotal
    );


    /* =====================================================
       INITIAL TOTAL
       ===================================================== */

    updateTotal();


    /* =====================================================
       PLACE ORDER
       ===================================================== */

    placeOrderButton.addEventListener(
        "click",
        async function () {

            /* ---------------------------------------------
               CLEAR OLD MESSAGE
               --------------------------------------------- */

            orderMessage.textContent = "";
            orderMessage.className = "";


            /* ---------------------------------------------
               GET FORM VALUES
               --------------------------------------------- */

            const customerName =
                nameInput.value.trim();

            const customerPhone =
                phoneInput.value.trim();

            const address =
                addressInput.value.trim();

            let quantity =
                parseInt(quantityInput.value, 10);


            /* ---------------------------------------------
               VALIDATE NAME
               --------------------------------------------- */

            if (!customerName) {

                orderMessage.textContent =
                    "Please enter your name.";

                orderMessage.className =
                    "error";

                nameInput.focus();

                return;
            }


            /* ---------------------------------------------
               VALIDATE PHONE
               --------------------------------------------- */

            const cleanPhone =
                customerPhone.replace(/\D/g, "");

            if (
                cleanPhone.length !== 10
            ) {

                orderMessage.textContent =
                    "Please enter a valid 10-digit mobile number.";

                orderMessage.className =
                    "error";

                phoneInput.focus();

                return;
            }


            /* ---------------------------------------------
               VALIDATE ADDRESS
               --------------------------------------------- */

            if (!address) {

                orderMessage.textContent =
                    "Please enter your delivery address.";

                orderMessage.className =
                    "error";

                addressInput.focus();

                return;
            }


            /* ---------------------------------------------
               VALIDATE QUANTITY
               --------------------------------------------- */

            if (
                isNaN(quantity) ||
                quantity < MINIMUM_ORDER
            ) {

                orderMessage.textContent =
                    "Minimum order is " +
                    MINIMUM_ORDER +
                    " kg.";

                orderMessage.className =
                    "error";

                quantityInput.focus();

                return;
            }


            /* ---------------------------------------------
               CALCULATE TOTAL
               --------------------------------------------- */

            const total =
                quantity * PRICE_PER_KG;


            /* ---------------------------------------------
               CREATE ORDER REFERENCE
               --------------------------------------------- */

            const orderReference =
                "MM-" +
                Date.now().toString();


            /* ---------------------------------------------
               ORDER DATA
               --------------------------------------------- */

            const orderData = {

                customer_name:
                    customerName,

                customer_phone:
                    cleanPhone,

                quantity_kg:
                    quantity,

                address:
                    address,

                total_amount:
                    total,

                status:
                    "New"
            };


            /* ---------------------------------------------
               DISABLE BUTTON
               --------------------------------------------- */

            placeOrderButton.disabled = true;

            const originalButtonText =
                placeOrderButton.textContent;

            placeOrderButton.textContent =
                "Saving Order...";


            try {

                console.log(
                    "Sending order to Supabase:",
                    orderData
                );


                /* =========================================
                   INSERT ORDER
                   
                   IMPORTANT:
                   NO .select()
                   NO .single()

                   This prevents an RLS SELECT problem.
                   ========================================= */

                const { error: insertError } =
                    await window.manaSupabase
                        .from("orders")
                        .insert([orderData]);


                /* =========================================
                   CHECK INSERT ERROR
                   ========================================= */

                if (insertError) {

                    console.error(
                        "ORDER INSERT ERROR:",
                        insertError
                    );

                    orderMessage.textContent =
                        "Order could not be saved. " +
                        insertError.message;

                    orderMessage.className =
                        "error";

                    placeOrderButton.disabled =
                        false;

                    placeOrderButton.textContent =
                        originalButtonText;

                    return;
                }


                /* =========================================
                   ORDER SUCCESSFULLY SAVED
                   ========================================= */

                console.log(
                    "Order successfully saved."
                );


                /* =========================================
                   PREPARE NOTIFICATION DATA
                   ========================================= */

                const notificationOrder = {

                    id:
                        orderReference,

                    customer_name:
                        customerName,

                    customer_phone:
                        cleanPhone,

                    quantity_kg:
                        quantity,

                    address:
                        address,

                    total_amount:
                        total,

                    status:
                        "New"
                };


                /* =========================================
                   SHOW SUCCESS IMMEDIATELY
                   
                   The order is already saved.
                   ========================================= */

                orderMessage.textContent =
                    "Order placed successfully! " +
                    "We will contact you for confirmation.";

                orderMessage.className =
                    "success";


                /* =========================================
                   SEND OWNER EMAIL NOTIFICATION
                   ========================================= */

                try {

                    console.log(
                        "Sending owner notification..."
                    );


                    const {
                        data: functionData,
                        error: functionError
                    } =
                        await window.manaSupabase.functions.invoke(
                            EDGE_FUNCTION_NAME,
                            {
                                body: {
                                    order:
                                        notificationOrder
                                }
                            }
                        );


                    if (functionError) {

                        console.error(
                            "Notification function error:",
                            functionError
                        );

                    } else {

                        console.log(
                            "Notification response:",
                            functionData
                        );

                    }

                } catch (notificationError) {

                    /*
                     * Do NOT mark the order as failed.
                     * The order has already been saved.
                     */

                    console.error(
                        "Notification error:",
                        notificationError
                    );
                }


                /* =========================================
                   RESET FORM
                   ========================================= */

                nameInput.value = "";
                phoneInput.value = "";
                addressInput.value = "";

                quantityInput.value =
                    MINIMUM_ORDER;

                updateTotal();


                /* =========================================
                   RESTORE BUTTON
                   ========================================= */

                placeOrderButton.disabled =
                    false;

                placeOrderButton.textContent =
                    originalButtonText;


                /* =========================================
                   OPTIONAL SUCCESS MESSAGE UPDATE
                   ========================================= */

                setTimeout(() => {

                    if (orderMessage) {

                        orderMessage.textContent =
                            "✅ Order placed successfully! " +
                            "Thank you for ordering from Mana Masala.";

                        orderMessage.className =
                            "success";
                    }

                }, 500);


            } catch (error) {

                console.error(
                    "UNEXPECTED ORDER ERROR:",
                    error
                );


                orderMessage.textContent =
                    "Something went wrong. " +
                    "Please try again later.";

                orderMessage.className =
                    "error";


                placeOrderButton.disabled =
                    false;

                placeOrderButton.textContent =
                    originalButtonText;
            }

        }
    );


    console.log(
        "Mana Masala order system ready."
    );
}


/* =========================================================
   START APPLICATION
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeManaMasala
);
