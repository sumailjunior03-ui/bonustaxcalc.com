"use strict";

/* ── UTILITIES ── */
function $(id) { return document.getElementById(id); }

function parseNum(val) {
  var n = parseFloat(String(val).replace(/[$,\s]/g, ""));
  return isNaN(n) ? NaN : n;
}

function fmt(n) {
  return "$" + n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

/* ── CALC ENGINE ── */
function calculateBonusWithholding(bonusAmount, ytdSupplementalWages, ytdTotalWages) {
  // Step 1: Federal supplemental withholding (split-rate per IRS Pub 15)
  var totalSupplemental = bonusAmount + ytdSupplementalWages;
  var federalWithholding;
  if (totalSupplemental <= 1000000) {
    federalWithholding = bonusAmount * 0.22;
  } else {
    var amountBelowThreshold = Math.max(0, 1000000 - ytdSupplementalWages);
    var amountAboveThreshold = bonusAmount - amountBelowThreshold;
    federalWithholding = (amountBelowThreshold * 0.22) + (amountAboveThreshold * 0.37);
  }

  // Step 2: Social Security (6.2%, 2025 wage base $176,100)
  var ssWageBase = 176100;
  var totalWagesAfterBonus = ytdTotalWages + bonusAmount;
  var ssTax;
  if (ytdTotalWages >= ssWageBase) {
    ssTax = 0;
  } else if (totalWagesAfterBonus > ssWageBase) {
    ssTax = (ssWageBase - ytdTotalWages) * 0.062;
  } else {
    ssTax = bonusAmount * 0.062;
  }

  // Step 3: Medicare (1.45%, no cap)
  var medicareTax = bonusAmount * 0.0145;

  // Step 4: Additional Medicare (0.9% above $200,000)
  var additionalMedicareThreshold = 200000;
  var additionalMedicareTax;
  if (ytdTotalWages >= additionalMedicareThreshold) {
    additionalMedicareTax = bonusAmount * 0.009;
  } else if (totalWagesAfterBonus > additionalMedicareThreshold) {
    var amountOverThreshold = totalWagesAfterBonus - additionalMedicareThreshold;
    additionalMedicareTax = Math.min(amountOverThreshold, bonusAmount) * 0.009;
  } else {
    additionalMedicareTax = 0;
  }

  // Step 5: Totals
  var totalWithholding = federalWithholding + ssTax + medicareTax + additionalMedicareTax;
  var netBonus = bonusAmount - totalWithholding;

  return {
    bonusAmount: bonusAmount,
    ytdSupplementalWages: ytdSupplementalWages,
    ytdTotalWages: ytdTotalWages,
    totalSupplemental: totalSupplemental,
    federalRate: totalSupplemental <= 1000000 ? 0.22 : "split",
    federalWithholding: federalWithholding,
    ssTax: ssTax,
    medicareTax: medicareTax,
    additionalMedicareTax: additionalMedicareTax,
    totalWithholding: totalWithholding,
    netBonus: netBonus
  };
}

/* ── RENDER ── */
function renderResults(r) {
  var results = $("results");
  if (!results) return;

  var federalRateLabel;
  if (r.federalRate === "split") {
    var belowThreshold = Math.max(0, 1000000 - r.ytdSupplementalWages);
    var aboveThreshold = r.bonusAmount - belowThreshold;
    federalRateLabel = "22% on " + fmt(belowThreshold) + " + 37% on " + fmt(aboveThreshold);
  } else {
    federalRateLabel = "22%";
  }

  var ssNote = r.ssTax === 0
    ? "No Social Security — year-to-date wages already exceed $176,100"
    : "6.2% (stops at $176,100 wage base)";

  var addMedicareNote = r.additionalMedicareTax === 0
    ? ""
    : '<div class="result-row"><span class="label">Additional Medicare (0.9% above $200K)</span><strong>' + fmt(r.additionalMedicareTax) + '</strong></div>';

  results.innerHTML =
    '<div class="result-grid">' +
      '<div class="result-row"><span class="label">Bonus amount</span><strong>' + fmt(r.bonusAmount) + '</strong></div>' +
      '<div class="result-row"><span class="label">Federal supplemental withholding (' + federalRateLabel + ')</span><strong>' + fmt(r.federalWithholding) + '</strong></div>' +
      '<div class="result-row"><span class="label">Social Security (' + ssNote + ')</span><strong>' + fmt(r.ssTax) + '</strong></div>' +
      '<div class="result-row"><span class="label">Medicare (1.45%)</span><strong>' + fmt(r.medicareTax) + '</strong></div>' +
      addMedicareNote +
      '<div class="result-row total"><span class="label">Total withholding</span><strong>' + fmt(r.totalWithholding) + '</strong></div>' +
      '<div class="result-row net"><span class="label">What you actually receive</span><strong>' + fmt(r.netBonus) + '</strong></div>' +
    '</div>' +
    '<p class="result-note">This is what gets withheld from your bonus — not your final tax bill. You may owe more or get a refund when you file.</p>';
}

/* ── CALCULATE ── */
function calculate() {
  var bonusAmount = parseNum($("bonusAmount") ? $("bonusAmount").value : "");
  var ytdSupplemental = parseNum($("ytdSupplemental") ? $("ytdSupplemental").value : "");
  var ytdTotalWages = parseNum($("ytdTotalWages") ? $("ytdTotalWages").value : "");

  if (isNaN(bonusAmount) || bonusAmount <= 0) {
    var results = $("results");
    if (results) results.innerHTML = "";
    return;
  }

  if (isNaN(ytdSupplemental)) ytdSupplemental = 0;
  if (isNaN(ytdTotalWages)) ytdTotalWages = 0;

  renderResults(calculateBonusWithholding(bonusAmount, ytdSupplemental, ytdTotalWages));
}

/* ── INIT ── */
document.addEventListener("DOMContentLoaded", function () {
  ["bonusAmount", "ytdSupplemental", "ytdTotalWages"].forEach(function (id) {
    var el = $(id);
    if (el) el.addEventListener("input", calculate);
  });

  var form = $("bonusTaxForm");
  if (form) form.addEventListener("submit", function (e) { e.preventDefault(); calculate(); });

  calculate();
});
