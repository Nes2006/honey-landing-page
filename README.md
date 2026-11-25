# 🍯 ฟาร์มผึ้งสุวรรณ (Honey Landing Page + Google Sheet Fulfillment)

โปรเจกต์แลนดิ้งเพจขายน้ำผึ้งแท้ (3 SKUs) เชื่อมต่อ **Google Sheet** เพื่อเก็บข้อมูลคำสั่งซื้อ พร้อมหน้า **ระบบหยิบสินค้า แพ็คสินค้า และพิมพ์ใบจ่าหน้าพัสดุ**

## โครงสร้างไฟล์
- `index.html`, `styles.css`, `app.js` — หน้า Landing Page ขายน้ำผึ้ง + ฟอร์มสั่งซื้อส่งเข้า Google Sheet
- `fulfillment.html`, `fulfillment.js` — หน้าหลังบ้านสำหรับหยิบสินค้า (Pick), แพ็คสินค้า (Pack) และพิมพ์ใบจ่าหน้าพัสดุ (Shipping Label)
- `config.js` — ตั้งค่าสินค้า (SKUs), ข้อมูลผู้ส่ง และ Google Apps Script URL
- `images/` — โฟลเดอร์เก็บรูปภาพสินค้าและแบนเนอร์แยกต่างหากใน GitHub
- `google-apps-script/Code.gs` — โค้ดสำหรับนำไปวางใน Google Sheet Apps Script

---

## วิธีเชื่อมต่อ Google Sheet (ทำตามนี้ 2 นาที)
1. สร้าง **Google Sheet** ใหม่บน Google Drive
2. ไปที่เมนู **Extensions (ส่วนขยาย) > Apps Script**
3. ลบโค้ดเดิมออกทั้งหมด แล้วคัดลอกโค้ดจากไฟล์ `google-apps-script/Code.gs` มาวางแทน
4. กด **Deploy > New deployment**
   - Select type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
5. กด **Deploy** แล้วคัดลอก **Web app URL** (ที่ลงท้ายด้วย `/exec`)
6. นำ URL มาวางในไฟล์ `config.js` ที่ตัวแปร `GOOGLE_SCRIPT_URL` (หรือกดปุ่ม `⚙️ ตั้งค่า Google Sheet URL` ในหน้า `fulfillment.html`)

---

## วิธีนำขึ้น GitHub และ Deploy บน Vercel
1. สร้าง Repository ใหม่บน GitHub แล้ว Push โค้ดชุดนี้ขึ้นไป:
   ```bash
   git add .
   git commit -m "Initial honey landing page with Google Sheet fulfillment"
   git branch -M main
   git remote add origin https://github.com/<USERNAME>/<REPO>.git
   git push -u origin main
   ```
2. เข้าไปที่ [Vercel](https://vercel.com/) → **Add New Project** → เลือก Repository จาก GitHub
3. ไม่ต้องตั้งค่า Build Command (Framework Preset: `Other`) → กด **Deploy** ได้ทันที
