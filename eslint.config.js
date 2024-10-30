// eslint.config.js
import js from "@eslint/js";
import promise from "eslint-plugin-promise";
import standard from "eslint-plugin-standard";

export default [
  {
    ignores: ["build/**/*.js", "config/**/*.js", "lib/**/*.js"], // แทน .eslintignore
  },
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",  // รองรับ ECMAScript รุ่นล่าสุด
      sourceType: "module",   // ใช้ ES Modules
      globals: {
        angular: "readonly",  // กำหนด angular เป็น global
      },
    },
    plugins: {
      promise,
      standard,
    },
    rules: {
      ...js.configs.recommended.rules, // ใช้กฎพื้นฐานจาก ESLint
      ...promise.configs.recommended.rules, // รวมกฎจาก plugin promise
      "no-console": "off", // เตือนเมื่อใช้ console.log
      "no-unused-vars": "off", // เตือนเมื่อมีตัวแปรที่ไม่ได้ใช้
      "indent": ["error", 2], // เยื้อง 2 spaces
      "quotes": ["error", "single"], // ใช้ single quotes
      "semi": ["error", "never"], // ไม่ใช้ semicolon
      "space-before-function-paren": ["error", "always"], // มี space ก่อนวงเล็บฟังก์ชัน
      "array-callback-return": "off", // ปิดการตรวจสอบ return ใน array method
      "no-undef": "off", // ปิดการแจ้งเตือน undefined (ใช้กับ require และ exports)
      "prefer-const": "off", // เตือนหากตัวแปรควรใช้ const
    },
  },
];