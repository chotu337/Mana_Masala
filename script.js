/* =========================================
   MANA MASALA - SUPABASE ORDER SYSTEM
========================================= */

const SUPABASE_URL =
    "https://hcczhnmdipqrnbxviuln.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_EHoyeiRqm91Y1XIUoLHZvw_37-6eJhI";

const PRICE_PER_KG = 400;
const MINIMUM_ORDER = 10;


/* =========================================
   LOAD SUPABASE
========================================= */

const supabaseScript = document.createElement("script");

supabaseScript.src =
    "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";

supabaseScript.onload = function () {

    window.manaSupabase =
        window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_KEY
        );

    console.log("✅ Supabase connected");

};

supabaseScript.onerror = function () {

    console.error(
        "❌ Supabase library could not be loaded."
    );

};

document.head.appendChild(supabaseScript);


/* =========================================
   GET HTML ELEMENTS
========================================= */

const quantityInput =
    document.getElementById("quantity");

const decreaseButton =
    document.getElementById("decreaseQuantity");

const increaseButton =
    document.getElementById("increaseQuantity");

const summaryQuantity =
    document.getElementById("summaryQuantity");

const totalPrice =
    document.getElementById("totalPrice");

const placeOrderButton =
    document.getElementById("placeOrderButton");

const orderMessage =
    document.getElementById("orderMessage");


/* =========================================
   UPDATE TOTAL
========================================= */

function updateTotal() {

    let quantity =
        parseInt(quantityInput.value);

    if (
        isNaN(quantity) ||
        quantity < MINIMUM_ORDER
    ) {

        quantity = MINIMUM_ORDER;

        quantityInput.value =
            MINIMUM_ORDER;
    }

    const total =
        quantity * PRICE_PER_KG;

    summaryQuantity.textContent =
        quantity;

    totalPrice.textContent =
        total.toLocaleString("en-IN");
}


/* =========================================
   SHOW MESSAGE
========================================= */

function showMessage(message, type) {

    orderMessage.textContent =
        message;

    if (type === "success") {

        orderMessage.style.color =
            "green";

    } else {

        orderMessage.style.color =
            "red";
    }
}


/* =========================================
   PLUS BUTTON
========================================= */

increaseButton.addEventListener(
    "click",
    function () {

        let quantity =
            parseInt(quantityInput.value);

        if (isNaN(quantity)) {

            quantity =
                MINIMUM_ORDER;
        }

        quantity++;

        quantityInput.value =
            quantity;

        updateTotal();
    }
);


/* =========================================
   MINUS BUTTON
========================================= */

decreaseButton.addEventListener(
    "click",
    function () {

        let quantity =
            parseInt(quantityInput.value);

        if (
            isNaN(quantity) ||
            quantity <= MINIMUM_ORDER
        ) {

            quantity =
                MINIMUM_ORDER;

        } else {

            quantity--;
        }

        quantityInput.value =
            quantity;

        updateTotal();
    }
);


/* =========================================
   MANUAL QUANTITY
========================================= */

quantityInput.addEventListener(
    "input",
    function () {

        updateTotal();

    }
);


/* =========================================
   PLACE ORDER
========================================= */

placeOrderButton.addEventListener(
    "click",
    async function () {

        const customerName =
            document
                .getElementById("customerName")
                .value
                .trim();

        const customerPhone =
            document
                .getElementById("customerPhone")
                .value
                .trim();

        const quantity =
            parseInt(
                quantityInput.value
            );

        const address =
            document
                .getElementById("address")
                .value
                .trim();


        /* =====================================
           NAME VALIDATION
        ===================================== */

        if (customerName === "") {

            showMessage(
                "❌ Please enter your name.",
                "error"
            );

            return;
        }


        /* =====================================
           PHONE VALIDATION
        ===================================== */

        if (
            !/^[0-9]{10}$/.test(
                customerPhone
            )
        ) {

            showMessage(
                "❌ Please enter a valid 10-digit phone number.",
                "error"
            );

            return;
        }


        /* =====================================
           QUANTITY VALIDATION
        ===================================== */

        if (
            isNaN(quantity) ||
            quantity < MINIMUM_ORDER
        ) {

            showMessage(
                "❌ Minimum order is 10 kg.",
                "error"
            );

            return;
        }


        /* =====================================
           ADDRESS VALIDATION
        ===================================== */

        if (address === "") {

            showMessage(
                "❌ Please enter your delivery address.",
                "error"
            );

            return;
        }


        /* =====================================
           CHECK SUPABASE
        ===================================== */

        if (!window.manaSupabase) {

            showMessage(
                "❌ Database is still connecting. Please wait a moment and try again.",
                "error"
            );

            return;
        }


        /* =====================================
           CALCULATE TOTAL
        ===================================== */

        const total =
            quantity * PRICE_PER_KG;


        /* =====================================
           DISABLE BUTTON
        ===================================== */

        placeOrderButton.disabled =
            true;

        placeOrderButton.textContent =
            "Placing Order...";


        try {

            console.log(
                "Sending order to Supabase..."
            );


            /* =================================
               INSERT ORDER
            ================================= */

            const { error } =
                await window.manaSupabase
                    .from("orders")
                    .insert([
                        {
                            customer_name:
                                customerName,

                            customer_phone:
                                customerPhone,

                            quantity_kg:
                                quantity,

                            address:
                                address,

                            total_amount:
                                total,

                            status:
                                "New"
                        }
                    ]);


            /* =================================
               CHECK DATABASE ERROR
            ================================= */

            if (error) {

                console.error(
                    "SUPABASE ERROR:",
                    error
                );

                console.error(
                    "ERROR MESSAGE:",
                    error.message
                );

                console.error(
                    "ERROR CODE:",
                    error.code
                );

                showMessage(
                    "❌ " + error.message,
                    "error"
                );

                return;
            }


            /* =================================
               SUCCESS
            ================================= */

            console.log(
                "✅ ORDER SAVED SUCCESSFULLY"
            );

            showMessage(
                "✅ Order placed successfully! Total amount: ₹" +
                total.toLocaleString("en-IN"),
                "success"
            );


            /* =================================
               CLEAR FORM
            ================================= */

            document.getElementById(
                "customerName"
            ).value = "";

            document.getElementById(
                "customerPhone"
            ).value = "";

            document.getElementById(
                "address"
            ).value = "";

            quantityInput.value =
                MINIMUM_ORDER;

            updateTotal();


        } catch (error) {

            console.error(
                "UNEXPECTED ERROR:",
                error
            );

            showMessage(
                "❌ " + error.message,
                "error"
            );

        } finally {

            /* =================================
               ENABLE BUTTON
            ================================= */

            placeOrderButton.disabled =
                false;

            placeOrderButton.textContent =
                "Place Order";
        }

    }
);


/* =========================================
   INITIAL TOTAL
========================================= */

updateTotal();