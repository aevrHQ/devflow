import { encrypt, decrypt, encryptJSON, decryptJSON } from "../lib/encryption";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function main() {
  console.log("🔒 Testing Encryption...");

  if (!process.env.PAYLOAD_ENCRYPTION_KEY) {
    console.error("❌ PAYLOAD_ENCRYPTION_KEY is missing in .env.local");
    // Generate a suggested key
    const crypto = await import("crypto");
    const suggestion = crypto.randomBytes(32).toString("hex");
    console.log(`💡 Suggested Key: ${suggestion}`);
    process.exit(1);
  }

  const secretMessage = "This is a secret payload";
  const encrypted = encrypt(secretMessage);
  console.log(`📝 Encrypted: ${encrypted}`);

  const decrypted = decrypt(encrypted);
  console.log(`🔓 Decrypted: ${decrypted}`);

  if (secretMessage === decrypted) {
    console.log("✅ String Encryption Verified");
  } else {
    console.error("❌ String Encryption Failed");
  }

  const complexObject = { foo: "bar", nested: { secret: 123 } };
  const encryptedJSON = encryptJSON(complexObject);
  const decryptedJSON = decryptJSON(encryptedJSON);

  if (JSON.stringify(complexObject) === JSON.stringify(decryptedJSON)) {
    console.log("✅ JSON Encryption Verified");
  } else {
    console.error("❌ JSON Encryption Failed");
  }
}

main().catch(console.error);
