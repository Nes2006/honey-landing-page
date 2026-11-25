document.addEventListener("DOMContentLoaded", () => {
  const productListEl = document.getElementById("product-list");
  const skuSelectEl = document.getElementById("sku-select");
  const quantityEl = document.getElementById("quantity");
  const orderForm = document.getElementById("order-form");
  const submitBtn = document.getElementById("submit-btn");
  const alertEl = document.getElementById("order-alert");

  const previewImg = document.getElementById("preview-img");
  const previewSku = document.getElementById("preview-sku");
  const previewName = document.getElementById("preview-name");
  const previewUnitPrice = document.getElementById("preview-unit-price");
  const summaryUnit = document.getElementById("summary-unit");
  const summaryQty = document.getElementById("summary-qty");
  const summaryTotal = document.getElementById("summary-total");

  function formatTHB(amount) {
    return "฿" + Number(amount).toLocaleString("th-TH");
  }

  // Render product cards & select options
  APP_CONFIG.PRODUCTS.forEach((product) => {
    const card = document.createElement("article");
    card.className = "product-card";
    card.innerHTML = `
      <div class="product-img-box">
        <img src="${product.image}" alt="${product.name}" loading="lazy" />
        <span class="product-badge">${product.badge}</span>
      </div>
      <div class="product-body">
        <div><span class="sku-tag">SKU: ${product.sku}</span></div>
        <h3 class="product-title">${product.name}</h3>
        <p class="product-desc">${product.description}</p>
        <div class="product-meta">
          <div>
            <span class="price-now">${formatTHB(product.price)}</span>
            <span class="price-old">${formatTHB(product.compareAtPrice)}</span>
          </div>
          <span style="font-size:0.82rem; color:var(--text-muted);">${product.weight}</span>
        </div>
        <button type="button" class="btn btn-primary select-sku-btn" data-sku="${product.sku}" style="width:100%;">
          เลือกสั่งซื้อรายการนี้
        </button>
      </div>
    `;
    productListEl.appendChild(card);

    const opt = document.createElement("option");
    opt.value = product.sku;
    opt.textContent = `[${product.sku}] ${product.name} - ${formatTHB(product.price)}`;
    skuSelectEl.appendChild(opt);
  });

  function updateSummary() {
    const selectedSku = skuSelectEl.value;
    const product = APP_CONFIG.PRODUCTS.find((p) => p.sku === selectedSku) || APP_CONFIG.PRODUCTS[0];
    const qty = Math.max(1, parseInt(quantityEl.value || "1", 10));
    const total = product.price * qty;

    previewImg.src = product.image;
    previewImg.alt = product.name;
    previewSku.textContent = product.sku;
    previewName.textContent = product.name;
    previewUnitPrice.textContent = `${formatTHB(product.price)} / ชิ้น`;

    summaryUnit.textContent = formatTHB(product.price);
    summaryQty.textContent = `${qty} ชิ้น`;
    summaryTotal.textContent = formatTHB(total);
  }

  document.querySelectorAll(".select-sku-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      skuSelectEl.value = btn.getAttribute("data-sku");
      updateSummary();
      document.getElementById("order").scrollIntoView({ behavior: "smooth" });
    });
  });

  skuSelectEl.addEventListener("change", updateSummary);
  quantityEl.addEventListener("input", updateSummary);
  updateSummary();

  function saveLocalDemoOrder(order) {
    const existing = JSON.parse(localStorage.getItem("HONEY_DEMO_ORDERS") || "[]");
    existing.unshift(order);
    localStorage.setItem("HONEY_DEMO_ORDERS", JSON.stringify(existing));
  }

  orderForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    alertEl.className = "alert";
    alertEl.textContent = "";

    const selectedSku = skuSelectEl.value;
    const product = APP_CONFIG.PRODUCTS.find((p) => p.sku === selectedSku) || APP_CONFIG.PRODUCTS[0];
    const quantity = Math.max(1, parseInt(quantityEl.value || "1", 10));
    const now = new Date();
    const orderId =
      "HNY-" +
      now.getFullYear().toString().slice(-2) +
      String(now.getMonth() + 1).padStart(2, "0") +
      String(now.getDate()).padStart(2, "0") +
      "-" +
      String(Math.floor(1000 + Math.random() * 9000));

    const payload = {
      orderId,
      timestamp: now.toLocaleString("th-TH"),
      customerName: document.getElementById("customerName").value.trim(),
      phone: document.getElementById("phone").value.trim(),
      address: document.getElementById("address").value.trim(),
      postalCode: document.getElementById("postalCode").value.trim(),
      sku: product.sku,
      productName: product.name,
      quantity,
      unitPrice: product.price,
      totalPrice: product.price * quantity,
      note: document.getElementById("note").value.trim(),
      status: "Pending"
    };

    submitBtn.disabled = true;
    submitBtn.textContent = "⏳ กำลังบันทึกคำสั่งซื้อ...";

    const scriptUrl = getGoogleScriptUrl();

    try {
      if (scriptUrl) {
        const res = await fetch(scriptUrl, {
          method: "POST",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify(payload)
        });
        const result = await res.json();
        if (!result.ok) {
          throw new Error(result.error || "บันทึกไม่สำเร็จ");
        }
        // สำรองไว้ใน localStorage ด้วยเผื่อเปิดดูออฟไลน์
        saveLocalDemoOrder(payload);

        alertEl.className = "alert alert-success show";
        alertEl.innerHTML = `
          <strong>🎉 สั่งซื้อสำเร็จ! รหัสออเดอร์: ${result.orderId || orderId}</strong><br />
          บันทึกข้อมูลลง Google Sheet เรียบร้อยแล้ว สามารถไปที่หน้า
          <a href="fulfillment.html" style="text-decoration:underline; font-weight:700;">ระบบหยิบ-แพ็ค &amp; จ่าหน้าพัสดุ</a>
          เพื่อดำเนินการจัดส่งได้เลย
        `;
      } else {
        // โหมดทดสอบ (ยังไม่ได้ใส่ Google Script URL)
        saveLocalDemoOrder(payload);
        alertEl.className = "alert alert-info show";
        alertEl.innerHTML = `
          <strong>✅ บันทึกออเดอร์ทดสอบสำเร็จ! (${orderId})</strong><br />
          หมายเหตุ: ยังไม่ได้ตั้งค่า Google Apps Script URL ระบบจึงบันทึกในเครื่องชั่วคราวไว้ให้ทดสอบหน้า
          <a href="fulfillment.html" style="text-decoration:underline; font-weight:700;">หยิบ-แพ็ค &amp; พิมพ์ใบจ่าหน้าพัสดุ</a>
          ได้ทันที
        `;
      }

      orderForm.reset();
      quantityEl.value = 1;
      updateSummary();
    } catch (err) {
      alertEl.className = "alert alert-info show";
      alertEl.textContent = "เกิดข้อผิดพลาดในการเชื่อมต่อ Google Sheet: " + err.message;
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "✅ ยืนยันการสั่งซื้อ";
    }
  });
});
