(function (global) {
  "use strict";

  var GOOGLE_SCRIPT_URL =
    "https://script.google.com/a/macros/dropshipguru.info/s/AKfycbzpPiH8gpzHvk9-AEHEKDq5WT7XnEsfJVIIz-ki3-BCprd4xLGaNQ2FJFHoyfy-qtlafQ/exec";

  var PAYLOAD_KEYS = [
    "fullName",
    "mobile",
    "email",
    "state",
    "profession",
    "selectedType",
    "selectedPlan",
    "selectedCourse",
    "selectedService",
    "selectedPlatform",
    "price",
    "budget",
    "message",
    "source"
  ];

  function emptyPayload() {
    return {
      fullName: "",
      mobile: "",
      email: "",
      state: "",
      profession: "",
      selectedType: "",
      selectedPlan: "",
      selectedCourse: "",
      selectedService: "",
      selectedPlatform: "",
      price: "",
      budget: "",
      message: "",
      source: "Website"
    };
  }

  function normalizePayload(data) {
    var base = emptyPayload();
    var input = data || {};
    PAYLOAD_KEYS.forEach(function (key) {
      if (Object.prototype.hasOwnProperty.call(input, key) && input[key] != null) {
        base[key] = String(input[key]);
      }
    });
    if (!base.source) base.source = "Website";
    return base;
  }

  function formatPrice(amount) {
    if (amount == null || amount === "") return "";
    var text = String(amount).trim();
    if (!text) return "";
    if (text.indexOf("₹") !== -1) return text;
    var raw = text.replace(/[^\d.]/g, "");
    if (!raw) return text;
    return "₹" + Number(raw).toLocaleString("en-IN");
  }

  function resolveSelectedType(ctx) {
    if (ctx.selectedType) return String(ctx.selectedType).toUpperCase();

    var params = new URLSearchParams(
      global.location && global.location.search ? global.location.search : ""
    );
    var courseParam = params.get("course");
    var planParam = params.get("plan");
    var serviceParam = params.get("service");

    if (courseParam || (ctx.selectedItem && ctx.selectedItem.kind === "course")) {
      return "COURSE";
    }
    if (planParam || (ctx.selectedItem && ctx.selectedItem.kind === "plan")) {
      return "PLAN";
    }
    if (serviceParam || (ctx.selectedItem && ctx.selectedItem.kind === "service")) {
      return "SERVICE";
    }
    if (ctx.selectedPlatformName) {
      return "PLATFORM";
    }
    return "CONSULTATION";
  }

  function buildFormPayload(ctx) {
    var payload = emptyPayload();
    var profession = ctx.profession || "";
    var bizExp = ctx.businessExperience || "";
    var budget = ctx.budget || "";
    var msg = ctx.message || "";
    var parts = [];

    if (bizExp) parts.push("Business Experience: " + bizExp);
    if (parts.length) {
      msg = (parts.join(" | ") + (msg ? "\n" + msg : "")).trim();
    }

    var selectedType = resolveSelectedType(ctx);
    var selectedItem = ctx.selectedItem || null;
    var itemName = selectedItem && selectedItem.name ? selectedItem.name : "";
    var itemPrice =
      (selectedItem && (selectedItem.displayAmount || selectedItem.price)) || "";

    payload.fullName = ctx.fullName || "";
    payload.mobile = ctx.mobile || "";
    payload.email = ctx.email || "";
    payload.state = ctx.state || "";
    payload.profession = profession;
    payload.selectedType = selectedType;
    payload.budget = budget;
    payload.message = msg;
    payload.source = "Website";

    if (selectedType === "PLAN") {
      payload.selectedPlan = itemName;
      payload.price = formatPrice(itemPrice);
    } else if (selectedType === "COURSE") {
      payload.selectedCourse = itemName;
      payload.price = formatPrice(itemPrice);
    } else if (selectedType === "SERVICE") {
      payload.selectedService = itemName;
      payload.price = formatPrice(itemPrice);
    } else if (selectedType === "PLATFORM") {
      payload.selectedPlatform = ctx.selectedPlatformName || "";
      payload.price = ctx.selectedPlatformPrice
        ? formatPrice(ctx.selectedPlatformPrice)
        : formatPrice(ctx.displayedPrice || "");
    }

    return normalizePayload(payload);
  }

  function buildConsultationPayload(ctx) {
    return buildFormPayload(ctx);
  }

  function parseResponseBody(text) {
    if (!text) return null;
    try {
      return JSON.parse(text);
    } catch (e) {
      return null;
    }
  }

  function isSuccessResponse(res, body) {
    if (!res || !res.ok) return false;
    if (!body) return true;
    if (body.success === false || body.status === "error") return false;
    if (body.success === true || body.result === "success") return true;
    return true;
  }

  function submitToGoogleSheet(formData) {
    var payload = normalizePayload(formData);
    // Send the payload as URL-encoded form fields. Passing a URLSearchParams body
    // makes fetch set Content-Type: application/x-www-form-urlencoded automatically
    // — a CORS-SAFELISTED value — and we set NO custom headers, so this stays a
    // "simple" request and the browser never fires a CORS preflight (OPTIONS).
    // Every field is preserved and is readable server-side via e.parameter.<field>.
    var params = new URLSearchParams();
    Object.keys(payload).forEach(function (key) {
      params.append(key, payload[key]);
    });
    return fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      body: params
    }).then(function (res) {
      return res.text().then(function (text) {
        var body = parseResponseBody(text);
        if (!isSuccessResponse(res, body)) {
          var err = new Error(
            (body && (body.message || body.error)) || "Submission failed"
          );
          err.response = res;
          err.body = body;
          throw err;
        }
        return {
          ok: true,
          status: res.status,
          body: body,
          text: text,
          payload: payload
        };
      });
    });
  }

  global.GOOGLE_SCRIPT_URL = GOOGLE_SCRIPT_URL;
  global.GoogleSheetSubmit = {
    URL: GOOGLE_SCRIPT_URL,
    PAYLOAD_KEYS: PAYLOAD_KEYS,
    emptyPayload: emptyPayload,
    normalizePayload: normalizePayload,
    buildFormPayload: buildFormPayload,
    buildConsultationPayload: buildConsultationPayload,
    submitToGoogleSheet: submitToGoogleSheet,
    formatPrice: formatPrice,
    resolveSelectedType: resolveSelectedType
  };
})(typeof window !== "undefined" ? window : globalThis);
