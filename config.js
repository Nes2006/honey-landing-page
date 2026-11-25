/**
 * การตั้งค่าหลักของร้านน้ำผึ้ง (แก้ไขได้ตามต้องการ)
 */
const APP_CONFIG = {
  // นำ Web App URL ที่ได้จากการ Deploy Google Apps Script มาวางที่นี่
  // ตัวอย่าง: "https://script.google.com/macros/s/AKfycb.../exec"
  GOOGLE_SCRIPT_URL: "",

  // ข้อมูลผู้ส่งสำหรับพิมพ์ใบจ่าหน้าพัสดุ
  SENDER: {
    name: "ฟาร์มผึ้งสุวรรณ (Suwan Honey Farm)",
    phone: "089-123-4567",
    address: "88/9 หมู่ 4 ต.แม่ริม อ.แม่ริม จ.เชียงใหม่",
    postalCode: "50180"
  },

  // รายการสินค้า (อย่างน้อย 2 SKUs ตามโจทย์)
  PRODUCTS: [
    {
      sku: "HONEY-LNG-500",
      name: "น้ำผึ้งดอกลำไยแท้ 100% (500 กรัม)",
      shortName: "น้ำผึ้งดอกลำไย 500g",
      price: 290,
      compareAtPrice: 350,
      weight: "500 กรัม",
      origin: "สวนลำไย จ.เชียงใหม่",
      badge: "ขายดีอันดับ 1",
      image: "images/sku-longan.jpg",
      description: "หอมละมุนกลิ่นดอกลำไย หวานธรรมชาติ ไม่ผสมน้ำตาล เก็บสดใหม่จากเกสรดอกลำไยภาคเหนือ เหมาะสำหรับชงเครื่องดื่มและบำรุงสุขภาพ"
    },
    {
      sku: "HONEY-WLD-500",
      name: "น้ำผึ้งป่าเดือนห้า (500 กรัม)",
      shortName: "น้ำผึ้งป่าเดือนห้า 500g",
      price: 390,
      compareAtPrice: 450,
      weight: "500 กรัม",
      origin: "ป่าธรรมชาติ จ.น่าน",
      badge: "Limited Harvest",
      image: "images/sku-wildforest.jpg",
      description: "น้ำผึ้งป่าแท้เก็บเกี่ยวช่วงเดือนห้า สีอำพันเข้ม รสชาติกลมกล่อม อุดมด้วยสารต้านอนุมูลอิสระและแร่ธาตุจากดอกไม้ป่านานาพันธุ์"
    },
    {
      sku: "HONEY-DUO-SET",
      name: "ชุดคู่หูน้ำผึ้งแท้ 2 รสชาติ (500g x 2)",
      shortName: "ชุดคู่หู 2 ขวด (ลำไย + ป่าเดือนห้า)",
      price: 640,
      compareAtPrice: 800,
      weight: "1,000 กรัม",
      origin: "เชียงใหม่ & น่าน",
      badge: "คุ้มสุด ประหยัด 160฿",
      image: "images/hero-honey.jpg",
      description: "รวมน้ำผึ้งดอกลำไย 1 ขวด + น้ำผึ้งป่าเดือนห้า 1 ขวด พร้อมกล่องของขวัญ จัดส่งฟรีทั่วประเทศ"
    }
  ]
};

/**
 * ดึง Google Script URL (ใช้ค่าจาก localStorage ก่อน ถ้าไม่มีจึงใช้จาก config.js)
 */
function getGoogleScriptUrl() {
  const saved = localStorage.getItem("HONEY_GOOGLE_SCRIPT_URL");
  if (saved && saved.trim()) return saved.trim();
  return (APP_CONFIG.GOOGLE_SCRIPT_URL || "").trim();
}
