document.addEventListener("DOMContentLoaded", () => {
  const ordersContainer = document.getElementById("orders-container");
  const searchInput = document.getElementById("search-input");
  const statusFilter = document.getElementById("status-filter");
  const connectionPill = document.getElementById("connection-pill");
  const refreshBtn = document.getElementById("refresh-btn");
  const seedDemoBtn = document.getElementById("seed-demo-btn");

  // Modals
  const labelModal = document.getElementById("label-modal");
  const closeLabelModal = document.getElementById("close-label-modal");
  const printLabelBtn = document.getElementById("print-label-btn");

  const configModal = document.getElementById("config-modal");
  const configBtn = document.getElementById("config-btn");
  const closeConfigModal = document.getElementById("close-config-modal");
  const scriptUrlInput = document.getElementById("script-url-input");
  const saveConfigBtn = document.getElementById("save-config-btn");
  const clearConfigBtn = document.getElementById("clear-config-btn");

  let allOrders = [];

  function findProduct(sku) {
    return APP_CONFIG.PRODUCTS.find((p) => p.sku === sku) || APP_CONFIG.PRODUCTS[0];
  }

  function updateConnectionBadge() {
    const url = getGoogleScriptUrl();
    if (url) {
      connectionPill.textContent = "🟢 เชื่อมต่อ Google Sheet แล้ว";
      connectionPill.className = "status-badge status-Packed";
    } else {
      connectionPill.textContent = "🟡 โหมดทดสอบ (Local)";
      connectionPill.className = "status-badge status-Pending";
    }
  }

  function getLocalOrders() {
    return JSON.parse(localStorage.getItem("HONEY_DEMO_ORDERS") || "[]");
  }

  function saveLocalOrders(orders) {
    localStorage.setItem("HONEY_DEMO_ORDERS", JSON.stringify(orders));
  }

  async function loadOrders() {
    updateConnectionBadge();
    const url = getGoogleScriptUrl();
    ordersContainer.innerHTML = `<div class="stat-card" style="text-align:center;">⏳ กำลังโหลดข้อมูลออเดอร์...</div>`;

    if (url) {
      try {
        const res = await fetch(url);
        const data = await res.json();
        if (data.ok && Array.isArray(data.orders)) {
          allOrders = data.orders;
        } else {
          allOrders = getLocalOrders();
        }
      } catch (err) {
        console.error(err);
        allOrders = getLocalOrders();
      }
    } else {
      allOrders = getLocalOrders();
    }

    renderStats();
    renderOrders();
  }

  function renderStats() {
    document.getElementById("stat-total").textContent = allOrders.length;
    document.getElementById("stat-pending").textContent = allOrders.filter((o) => o.status === "Pending").length;
    document.getElementById("stat-picked").textContent = allOrders.filter((o) => o.status === "Picked").length;
    document.getElementById("stat-packed").textContent = allOrders.filter((o) => o.status === "Packed" || o.status === "Shipped").length;
  }

  function renderOrders() {
    const q = searchInput.value.trim().toLowerCase();
    const status = statusFilter.value;

    const filtered = allOrders.filter((o) => {
      const matchStatus = status === "ALL" || o.status === status;
      const matchQuery =
        !q ||
        String(o.orderId).toLowerCase().includes(q) ||
        String(o.customerName).toLowerCase().includes(q) ||
        String(o.phone).toLowerCase().includes(q) ||
        String(o.sku).toLowerCase().includes(q);
      return matchStatus && matchQuery;
    });

    if (filtered.length === 0) {
      ordersContainer.innerHTML = `
        <div class="stat-card" style="text-align:center; padding:36px;">
          <p style="color:var(--text-muted); margin-bottom:12px;">ยังไม่มีรายการคำสั่งซื้อที่ตรงกับเงื่อนไข</p>
          <a href="index.html#order" class="btn btn-primary btn-sm">ไปหน้าสั่งซื้อสินค้า</a>
        </div>
      `;
      return;
    }

    ordersContainer.innerHTML = "";
    filtered.forEach((order) => {
      const product = findProduct(order.sku);
      const card = document.createElement("div");
      card.className = "order-card";
      card.innerHTML = `
        <div>
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
            <strong style="font-family:monospace; font-size:1rem;">${order.orderId}</strong>
            <span class="status-badge status-${order.status}">${order.status}</span>
          </div>
          <div style="font-size:0.82rem; color:var(--text-muted); margin-bottom:10px;">🕒 ${order.timestamp || "-"}</div>
          <div class="pick-box">
            <img src="${product.image}" alt="${order.productName}" />
            <div>
              <span class="sku-tag">${order.sku}</span>
              <div style="font-weight:700; font-size:0.95rem;">${order.productName}</div>
              <div style="font-size:0.9rem; color:var(--amber-700); font-weight:700;">
                หยิบจำนวน: ${order.quantity} ชิ้น (฿${Number(order.totalPrice).toLocaleString("th-TH")})
              </div>
            </div>
          </div>
        </div>

        <div>
          <div style="font-size:0.82rem; font-weight:700; color:var(--text-muted); margin-bottom:4px;">ข้อมูลจัดส่งผู้รับ</div>
          <div style="font-weight:700; font-size:1.05rem;">${order.customerName}</div>
          <div style="font-weight:600; color:var(--amber-700);">📞 ${order.phone}</div>
          <div style="font-size:0.92rem; margin-top:4px;">
            ${order.address} <strong>${order.postalCode}</strong>
          </div>
          ${order.note ? `<div style="font-size:0.84rem; color:#B45309; margin-top:6px;">📝 หมายเหตุ: ${order.note}</div>` : ""}
        </div>

        <div class="action-stack">
          <button class="btn btn-outline btn-sm pick-btn" data-id="${order.orderId}">
            ${order.status === "Pending" ? "☑️ 1. ยืนยันหยิบสินค้า (Pick)" : "✅ หยิบสินค้าแล้ว"}
          </button>
          <button class="btn btn-outline btn-sm pack-btn" data-id="${order.orderId}">
            ${order.status === "Packed" || order.status === "Shipped" ? "✅ แพ็คสินค้าแล้ว" : "📦 2. ยืนยันแพ็คสินค้า (Pack)"}
          </button>
          <button class="btn btn-primary btn-sm label-btn" data-id="${order.orderId}">
            🏷️ 3. พิมพ์ใบจ่าหน้าพัสดุ
          </button>
        </div>
      `;
      ordersContainer.appendChild(card);
    });

    document.querySelectorAll(".pick-btn").forEach((btn) => {
      btn.addEventListener("click", () => updateOrderStatus(btn.dataset.id, "Picked"));
    });
    document.querySelectorAll(".pack-btn").forEach((btn) => {
      btn.addEventListener("click", () => updateOrderStatus(btn.dataset.id, "Packed"));
    });
    document.querySelectorAll(".label-btn").forEach((btn) => {
      btn.addEventListener("click", () => openShippingLabel(btn.dataset.id));
    });
  }

  async function updateOrderStatus(orderId, newStatus) {
    const target = allOrders.find((o) => o.orderId === orderId);
    if (!target) return;
    target.status = newStatus;

    // อัปเดตใน localStorage ด้วย
    const local = getLocalOrders();
    const localIdx = local.findIndex((o) => o.orderId === orderId);
    if (localIdx !== -1) {
      local[localIdx].status = newStatus;
      saveLocalOrders(local);
    }

    renderStats();
    renderOrders();

    const url = getGoogleScriptUrl();
    if (url) {
      try {
        await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify({
            action: "updateStatus",
            orderId,
            status: newStatus
          })
        });
      } catch (err) {
        console.error("Failed to sync status to Google Sheet:", err);
      }
    }
  }

  function openShippingLabel(orderId) {
    const order = allOrders.find((o) => o.orderId === orderId);
    if (!order) return;

    document.getElementById("lbl-order-id").textContent = order.orderId;
    document.getElementById("lbl-date").textContent = "วันที่พิมพ์: " + new Date().toLocaleString("th-TH");
    document.getElementById("lbl-sender-name").textContent = APP_CONFIG.SENDER.name;
    document.getElementById("lbl-sender-address").textContent =
      `${APP_CONFIG.SENDER.address} ${APP_CONFIG.SENDER.postalCode}`;
    document.getElementById("lbl-sender-phone").textContent = `โทร: ${APP_CONFIG.SENDER.phone}`;

    document.getElementById("lbl-recv-name").textContent = order.customerName;
    document.getElementById("lbl-recv-phone").textContent = `โทร: ${order.phone}`;
    document.getElementById("lbl-recv-address").textContent = order.address;
    document.getElementById("lbl-recv-zip").textContent = order.postalCode;

    document.getElementById("lbl-sku").textContent = order.sku;
    document.getElementById("lbl-product").textContent = order.productName;
    document.getElementById("lbl-qty").textContent = `${order.quantity} ชิ้น`;
    document.getElementById("lbl-total").textContent = `฿${Number(order.totalPrice).toLocaleString("th-TH")}`;
    document.getElementById("lbl-note").textContent = order.note ? `หมายเหตุ: ${order.note}` : "";

    labelModal.classList.add("open");
  }

  closeLabelModal.addEventListener("click", () => labelModal.classList.remove("open"));
  printLabelBtn.addEventListener("click", () => window.print());

  configBtn.addEventListener("click", () => {
    scriptUrlInput.value = getGoogleScriptUrl();
    configModal.classList.add("open");
  });
  closeConfigModal.addEventListener("click", () => configModal.classList.remove("open"));

  saveConfigBtn.addEventListener("click", () => {
    const val = scriptUrlInput.value.trim();
    if (val) {
      localStorage.setItem("HONEY_GOOGLE_SCRIPT_URL", val);
    }
    configModal.classList.remove("open");
    loadOrders();
  });

  clearConfigBtn.addEventListener("click", () => {
    localStorage.removeItem("HONEY_GOOGLE_SCRIPT_URL");
    scriptUrlInput.value = "";
    configModal.classList.remove("open");
    loadOrders();
  });

  seedDemoBtn.addEventListener("click", () => {
    const demos = [
      {
        orderId: "HNY-261125-1001",
        timestamp: new Date().toLocaleString("th-TH"),
        customerName: "กัญญาภัทร ใจดี",
        phone: "0812345678",
        address: "99/12 ถ.พหลโยธิน แขวงจตุจักร เขตจตุจักร กรุงเทพมหานคร",
        postalCode: "10900",
        sku: "HONEY-LNG-500",
        productName: "น้ำผึ้งดอกลำไยแท้ 100% (500 กรัม)",
        quantity: 2,
        unitPrice: 290,
        totalPrice: 580,
        note: "ห่อกันกระแทกหนาๆ นะคะ",
        status: "Pending"
      },
      {
        orderId: "HNY-261125-1002",
        timestamp: new Date().toLocaleString("th-TH"),
        customerName: "ณัฐพล รักธรรมชาติ",
        phone: "0898765432",
        address: "45 หมู่ 2 ต.สุเทพ อ.เมือง จ.เชียงใหม่",
        postalCode: "50200",
        sku: "HONEY-WLD-500",
        productName: "น้ำผึ้งป่าเดือนห้า (500 กรัม)",
        quantity: 1,
        unitPrice: 390,
        totalPrice: 390,
        note: "",
        status: "Picked"
      }
    ];
    const current = getLocalOrders();
    saveLocalOrders([...demos, ...current]);
    loadOrders();
  });

  searchInput.addEventListener("input", renderOrders);
  statusFilter.addEventListener("change", renderOrders);
  refreshBtn.addEventListener("click", loadOrders);

  loadOrders();
});
