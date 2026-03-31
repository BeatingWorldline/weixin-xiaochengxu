"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
if (!Array) {
  const _component_van_loading = common_vendor.resolveComponent("van-loading");
  _component_van_loading();
}
const guaranteeTarget = 30;
const cooldownEnabled = false;
const _sfc_defineComponent = common_vendor.defineComponent({
  __name: "index",
  setup(__props) {
    const pcFlag = common_vendor.ref(false);
    const pageLoading = common_vendor.ref(true);
    const canDraw = common_vendor.ref(true);
    const remainingTimes = common_vendor.ref(1);
    const nextDrawTime = common_vendor.ref(null);
    const countdownText = common_vendor.ref("");
    const lotteryHistory = common_vendor.ref([]);
    const isSpinning = common_vendor.ref(false);
    const showResultModal = common_vendor.ref(false);
    const currentIndex = common_vendor.ref(-1);
    const winnerIndex = common_vendor.ref(-1);
    const showResult = common_vendor.ref(false);
    const todayResults = common_vendor.ref([]);
    const winResult = common_vendor.ref({});
    const shareShow = common_vendor.ref(false);
    const beastTapped = common_vendor.ref(false);
    const luckTexts = common_vendor.ref([]);
    const luckCount = common_vendor.ref(0);
    let luckTextId = 0;
    const guaranteeProgress = common_vendor.ref(0);
    let countdownTimer = null;
    const guaranteeReady = common_vendor.computed(() => guaranteeProgress.value >= guaranteeTarget);
    const guaranteePercent = common_vendor.computed(() => Math.min(guaranteeProgress.value / guaranteeTarget, 1));
    const guaranteeRingBg = common_vendor.computed(() => {
      const activeColor = guaranteeReady.value ? "#ffe37a" : "#ff7a45";
      return `conic-gradient(${activeColor} ${guaranteePercent.value * 360}deg, rgba(255,255,255,0.25) 0deg)`;
    });
    const prizes = common_vendor.ref([
      { icon: "🍱", name: "5元盒饭加餐", type: "cash5" },
      { icon: "😭", name: "再接再励", type: "paid" },
      { icon: "🥤", name: "3元快乐水", type: "cash3" },
      { icon: "🥤", name: "3元快乐水", type: "cash3" },
      { icon: "🥤", name: "3元快乐水", type: "cash3" },
      { icon: "🎁", name: "清空购物车", type: "free" },
      { icon: "🍱", name: "5元盒饭加餐", type: "cash5" },
      { icon: "🍱", name: "5元盒饭加餐", type: "cash5" }
    ]);
    const prizeProbabilities = {
      free: 6,
      // 免单 6% (最高价值30元，最低概率)
      cash5: 40,
      // 五元红包 40% (中等价值，中等概率)
      cash3: 50,
      // 三元红包 50% (较低价值，较高概率)
      paid: 4
      // 收费 4%
    };
    common_vendor.onMounted(() => {
      checkLotteryStatus();
      startCountdown();
      setTimeout(() => {
        pageLoading.value = false;
      }, 200);
    });
    common_vendor.onShareAppMessage(() => {
      return {
        title: "抽奖赢免单",
        path: "/pages/index/index",
        imageUrl: "https://imgs.3dmgame.com/community/402ee1ae5daf455c99eb3c31c3c14f7d11762507624256.png"
      };
    });
    function checkLotteryStatus() {
      try {
        const todayKey = getDateKey(/* @__PURE__ */ new Date());
        const localData = loadLotteryData();
        if (!localData) {
          resetDailyData();
          return;
        }
        const data = { ...localData };
        guaranteeProgress.value = Number(data.guaranteeProgress) || 0;
        if (data.dateKey !== todayKey) {
          data.dateKey = todayKey;
          data.results = [];
          data.lastDrawTime = null;
          persistLotteryData(data);
          todayResults.value = [];
          canDraw.value = true;
          remainingTimes.value = 1;
          nextDrawTime.value = null;
          countdownText.value = "";
          return;
        }
        todayResults.value = data.results || [];
        if (!cooldownEnabled) {
          canDraw.value = true;
          remainingTimes.value = 1;
          nextDrawTime.value = null;
          countdownText.value = "";
          return;
        }
        if (data.lastDrawTime) {
          const lastDrawTime = new Date(data.lastDrawTime);
          const timeDiff = (/* @__PURE__ */ new Date()).getTime() - lastDrawTime.getTime();
          const fourHours = 4 * 60 * 60 * 1e3;
          if (timeDiff < fourHours) {
            canDraw.value = false;
            remainingTimes.value = 0;
            nextDrawTime.value = lastDrawTime.getTime() + fourHours;
          } else {
            canDraw.value = true;
            remainingTimes.value = 1;
            nextDrawTime.value = null;
          }
        } else {
          canDraw.value = true;
          remainingTimes.value = 1;
          nextDrawTime.value = null;
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/index/index.vue:312", "检查抽奖状态失败:", error);
        resetDailyData();
      }
    }
    function resetDailyData() {
      canDraw.value = true;
      remainingTimes.value = 1;
      nextDrawTime.value = null;
      todayResults.value = [];
      countdownText.value = "";
      const data = createLotteryData();
      guaranteeProgress.value = Number(data.guaranteeProgress) || 0;
      persistLotteryData(data);
    }
    function startCountdown() {
      if (countdownTimer) {
        clearInterval(countdownTimer);
      }
      countdownTimer = setInterval(() => {
        if (nextDrawTime.value && !canDraw.value) {
          const expireTime = Number(nextDrawTime.value);
          const timeDiff = expireTime - (/* @__PURE__ */ new Date()).getTime();
          if (timeDiff <= 0) {
            canDraw.value = true;
            remainingTimes.value = 1;
            nextDrawTime.value = null;
            countdownText.value = "";
          } else {
            const hours = Math.floor(timeDiff / (1e3 * 60 * 60));
            const minutes = Math.floor(timeDiff % (1e3 * 60 * 60) / (1e3 * 60));
            const seconds = Math.floor(timeDiff % (1e3 * 60) / 1e3);
            countdownText.value = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
          }
        }
      }, 1e3);
    }
    common_vendor.onUnmounted(() => {
      if (countdownTimer) {
        clearInterval(countdownTimer);
        countdownTimer = null;
      }
    });
    function startLottery() {
      if (!canDraw.value || remainingTimes.value <= 0) {
        if (countdownText.value) {
          common_vendor.index.__f__("log", "at pages/index/index.vue:367", `抽奖冷却中，请等待 ${countdownText.value} 后再试！`);
        } else {
          common_vendor.index.__f__("log", "at pages/index/index.vue:369", "今日抽奖次数已用完，请明日再来！");
        }
        return;
      }
      if (isSpinning.value)
        return;
      isSpinning.value = true;
      showResult.value = false;
      const result = generateLotteryResult();
      winnerIndex.value = result.index;
      winResult.value = result.prize;
      let spinCount = 0;
      const baseSpins = 16;
      const currentPos = currentIndex.value;
      const targetPos = winnerIndex.value;
      const stepsToTarget = ((targetPos - currentPos) % 8 + 8) % 8;
      const totalSpins = baseSpins + stepsToTarget;
      const spinInterval = setInterval(() => {
        currentIndex.value = (currentIndex.value + 1) % 8;
        spinCount++;
        if (spinCount >= totalSpins) {
          clearInterval(spinInterval);
          setTimeout(() => {
            isSpinning.value = false;
            showResult.value = true;
            showResultModal.value = true;
            saveLotteryResult(result);
            {
              canDraw.value = true;
              remainingTimes.value = 1;
              nextDrawTime.value = null;
              countdownText.value = "";
            }
          }, 500);
        }
      }, 100);
    }
    function generateLotteryResult() {
      const random = Math.random() * 100;
      let selectedType = "paid";
      if (random < prizeProbabilities.free) {
        selectedType = "free";
      } else if (random < prizeProbabilities.free + prizeProbabilities.cash5) {
        selectedType = "cash5";
      } else if (random < prizeProbabilities.free + prizeProbabilities.cash5 + prizeProbabilities.cash3) {
        selectedType = "cash3";
      } else {
        selectedType = "paid";
      }
      const availablePrizes = prizes.value.map((prize, index) => ({ ...prize, index })).filter((prize) => prize.type === selectedType);
      const selectedPrize = availablePrizes[Math.floor(Math.random() * availablePrizes.length)];
      let title, description;
      switch (selectedType) {
        case "free":
          title = "🎉今日运气爆棚!";
          description = "随心所欲买买买~";
          break;
        case "cash5":
          title = "🍚五元午饭加餐!";
          description = "吃饱饱，吃好好~";
          break;
        case "cash3":
          title = "🥤3元快乐水!";
          description = "快乐不简单~";
          break;
        default:
          title = "再接再励!";
          description = "平平淡淡才是真~";
      }
      return {
        index: selectedPrize.index,
        prize: {
          icon: selectedPrize.icon,
          title,
          description,
          name: selectedPrize.name,
          type: selectedPrize.type
        }
      };
    }
    function getDateKey(date) {
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const day = date.getDate().toString().padStart(2, "0");
      return `${year}-${month}-${day}`;
    }
    function formatDateTime(date) {
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const hour = date.getHours();
      const minute = date.getMinutes().toString().padStart(2, "0");
      const second = date.getSeconds().toString().padStart(2, "0");
      return `${year}/${month}/${day} ${hour}:${minute}:${second}`;
    }
    function createLotteryData(existingData = {}) {
      return {
        dateKey: getDateKey(/* @__PURE__ */ new Date()),
        results: [],
        lastDrawTime: null,
        guaranteeProgress: 0,
        guaranteeRewardCount: 0,
        ...existingData
      };
    }
    function loadLotteryData() {
      const localData = common_vendor.index.getStorageSync("lottery_data");
      if (!localData)
        return null;
      if (typeof localData === "string") {
        try {
          return JSON.parse(localData);
        } catch (error) {
          common_vendor.index.__f__("error", "at pages/index/index.vue:514", "解析本地抽奖数据失败:", error);
          return null;
        }
      }
      return localData;
    }
    function persistLotteryData(data) {
      common_vendor.index.setStorageSync("lottery_data", JSON.stringify(data));
    }
    function saveLotteryResult(result) {
      try {
        const todayKey = getDateKey(/* @__PURE__ */ new Date());
        const localData = loadLotteryData();
        const data = createLotteryData(localData || {});
        if (data.dateKey !== todayKey) {
          data.dateKey = todayKey;
          data.results = [];
          data.lastDrawTime = null;
        }
        const newResult = {
          icon: result.prize.icon,
          name: result.prize.name,
          type: result.prize.type,
          amount: result.amount || 0,
          time: formatDateTime(/* @__PURE__ */ new Date()),
          timestamp: (/* @__PURE__ */ new Date()).getTime()
        };
        data.results = [newResult];
        data.lastDrawTime = cooldownEnabled ? (/* @__PURE__ */ new Date()).toISOString() : null;
        if (result.prize.type === "free") {
          data.guaranteeProgress = 0;
        } else {
          data.guaranteeProgress = Math.min((Number(data.guaranteeProgress) || 0) + 1, guaranteeTarget);
        }
        persistLotteryData(data);
        todayResults.value = data.results;
        guaranteeProgress.value = Number(data.guaranteeProgress) || 0;
        const historyRecord = {
          ...newResult,
          isFree: result.prize.type === "free"
        };
        lotteryHistory.value.push(historyRecord);
        common_vendor.index.__f__("log", "at pages/index/index.vue:561", "🎲 抽奖结果记录:", {
          时间: historyRecord.time,
          结果: historyRecord.name,
          类型: historyRecord.type === "paid" ? "谢谢参与" : "奖励中奖",
          金额: historyRecord.amount || 0,
          图标: historyRecord.icon
        });
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/index/index.vue:569", "保存抽奖结果失败:", error);
      }
    }
    function claimGuaranteeReward() {
      if (!guaranteeReady.value) {
        showToast(`再抽 ${guaranteeTarget - guaranteeProgress.value} 次即可触发保底`);
        return;
      }
      if (isSpinning.value)
        return;
      if (!canDraw.value || remainingTimes.value <= 0) {
        if (countdownText.value) {
          showToast(`当前冷却中，${countdownText.value} 后可领奖`);
        } else {
          showToast("当前不可领奖，请稍后再试");
        }
        return;
      }
      const data = createLotteryData(loadLotteryData() || {});
      const now = /* @__PURE__ */ new Date();
      data.dateKey = getDateKey(now);
      data.guaranteeProgress = 0;
      data.guaranteeRewardCount = (Number(data.guaranteeRewardCount) || 0) + 1;
      data.lastDrawTime = null;
      data.results = [{
        icon: "🎁",
        name: "清空购物车",
        type: "free",
        amount: 0,
        time: formatDateTime(now),
        timestamp: now.getTime(),
        fromGuarantee: true
      }];
      persistLotteryData(data);
      guaranteeProgress.value = 0;
      todayResults.value = data.results;
      winnerIndex.value = 5;
      showResult.value = true;
      winResult.value = {
        icon: "🎁",
        title: "🎉保底触发成功!",
        description: "恭喜获得清空购物车奖励"
      };
      showResultModal.value = true;
      {
        canDraw.value = true;
        remainingTimes.value = 1;
        nextDrawTime.value = null;
        countdownText.value = "";
        showToast("保底奖励领取成功");
      }
    }
    function showToast(message) {
      common_vendor.index.showToast({
        title: message,
        icon: "none",
        duration: 2e3
      });
    }
    function closeResultModal() {
      showResultModal.value = false;
    }
    function tapBeast() {
      beastTapped.value = true;
      luckCount.value++;
      const luckMessages = ["功德+1", "好运+1", "财运+1"];
      const randomMessage = luckMessages[Math.floor(Math.random() * luckMessages.length)];
      const newLuckText = { id: ++luckTextId, content: randomMessage };
      luckTexts.value.push(newLuckText);
      setTimeout(() => {
        beastTapped.value = false;
      }, 300);
      setTimeout(() => {
        const index = luckTexts.value.findIndex((text) => text.id === newLuckText.id);
        if (index > -1) {
          luckTexts.value.splice(index, 1);
        }
      }, 1500);
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: pageLoading.value,
        b: common_vendor.p({
          size: "48px",
          vertical: true
        }),
        c: common_vendor.o(($event) => shareShow.value = true),
        d: common_vendor.t(prizeProbabilities.free + 2),
        e: common_vendor.t(prizeProbabilities.cash5),
        f: common_vendor.t(prizeProbabilities.cash3),
        g: common_vendor.t(prizeProbabilities.paid - 2),
        h: common_vendor.t(guaranteeProgress.value),
        i: common_vendor.t(guaranteeTarget),
        j: guaranteeRingBg.value,
        k: common_vendor.o(claimGuaranteeReward),
        l: guaranteeReady.value ? 1 : "",
        m: common_assets._imports_0,
        n: common_vendor.f(luckTexts.value, (text, index, i0) => {
          return {
            a: common_vendor.t(text.content),
            b: text.id,
            c: index * 0.1 + "s"
          };
        }),
        o: common_vendor.o(tapBeast),
        p: beastTapped.value ? 1 : "",
        q: common_vendor.t(prizes.value[0].icon),
        r: common_vendor.t(prizes.value[0].name),
        s: currentIndex.value === 0 && isSpinning.value ? 1 : "",
        t: winnerIndex.value === 0 && showResult.value ? 1 : "",
        v: common_vendor.t(prizes.value[1].icon),
        w: common_vendor.t(prizes.value[1].name),
        x: currentIndex.value === 1 && isSpinning.value ? 1 : "",
        y: winnerIndex.value === 1 && showResult.value ? 1 : "",
        z: common_vendor.t(prizes.value[2].icon),
        A: common_vendor.t(prizes.value[2].name),
        B: currentIndex.value === 2 && isSpinning.value ? 1 : "",
        C: winnerIndex.value === 2 && showResult.value ? 1 : "",
        D: common_vendor.t(prizes.value[7].icon),
        E: common_vendor.t(prizes.value[7].name),
        F: currentIndex.value === 7 && isSpinning.value ? 1 : "",
        G: winnerIndex.value === 7 && showResult.value ? 1 : "",
        H: !canDraw.value && countdownText.value
      }, !canDraw.value && countdownText.value ? {
        I: common_vendor.t(countdownText.value)
      } : !canDraw.value ? {} : isSpinning.value ? {} : {}, {
        J: !canDraw.value,
        K: isSpinning.value,
        L: common_vendor.t(remainingTimes.value),
        M: common_vendor.o(startLottery),
        N: !canDraw.value || isSpinning.value,
        O: common_vendor.t(prizes.value[3].icon),
        P: common_vendor.t(prizes.value[3].name),
        Q: currentIndex.value === 3 && isSpinning.value ? 1 : "",
        R: winnerIndex.value === 3 && showResult.value ? 1 : "",
        S: common_vendor.t(prizes.value[6].icon),
        T: common_vendor.t(prizes.value[6].name),
        U: currentIndex.value === 6 && isSpinning.value ? 1 : "",
        V: winnerIndex.value === 6 && showResult.value ? 1 : "",
        W: common_vendor.t(prizes.value[5].icon),
        X: common_vendor.t(prizes.value[5].name),
        Y: currentIndex.value === 5 && isSpinning.value ? 1 : "",
        Z: winnerIndex.value === 5 && showResult.value ? 1 : "",
        aa: common_vendor.t(prizes.value[4].icon),
        ab: common_vendor.t(prizes.value[4].name),
        ac: currentIndex.value === 4 && isSpinning.value ? 1 : "",
        ad: winnerIndex.value === 4 && showResult.value ? 1 : "",
        ae: todayResults.value.length > 0
      }, todayResults.value.length > 0 ? {
        af: common_vendor.t(todayResults.value[0].icon),
        ag: common_vendor.t(todayResults.value[0].name)
      } : {}, {
        ah: showResultModal.value
      }, showResultModal.value ? {
        ai: common_vendor.t(winResult.value.icon),
        aj: common_vendor.t(winResult.value.title),
        ak: common_vendor.t(winResult.value.description),
        al: common_vendor.o(closeResultModal),
        am: common_vendor.o(() => {
        }),
        an: common_vendor.o(closeResultModal)
      } : {}, {
        ao: !pageLoading.value,
        ap: common_vendor.n(pcFlag.value ? "activity-pc" : "")
      });
    };
  }
});
_sfc_defineComponent.__runtimeHooks = 2;
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_defineComponent, [["__scopeId", "data-v-1cf27b2a"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/index/index.js.map
