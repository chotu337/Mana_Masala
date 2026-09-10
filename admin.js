const SUPABASE_URL =
  "https://hcczhnmdipqrnbxviuln.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_EHoyeiRqm91Y1XIUoLHZvw_37-6eJhI";

const supabaseClient =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
  );

console.log("Supabase client created successfully");

async function testConnection() {
  const { data, error } =
    await supabaseClient.auth.getSession();

  console.log("SESSION:", data);
  console.log("ERROR:", error);

  if (error) {
    alert("Supabase error: " + error.message);
  } else {
    alert("Supabase connection is working!");
  }
}

testConnection();
