"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
if (!Array) {
  const _component_van_loading = common_vendor.resolveComponent("van-loading");
  _component_van_loading();
}
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
        path: "/pages/index/inde",
        imageUrl: "https://imgs.3dmgame.com/community/402ee1ae5daf455c99eb3c31c3c14f7d11762507624256.png"
      };
    });
    function checkLotteryStatus() {
      try {
        const today = formatDate(/* @__PURE__ */ new Date());
        const lotteryData = common_vendor.index.getStorageSync("lottery_data");
        if (lotteryData) {
          const data = JSON.parse(lotteryData);
          if (data.date !== today) {
            resetDailyData();
            return;
          }
          todayResults.value = data.results || [];
          if (data.lastDrawTime) {
            const lastDrawTime = new Date(data.lastDrawTime);
            const timeDiff = (/* @__PURE__ */ new Date()).getTime() - lastDrawTime.getTime();
            const fourHours = 4 * 60 * 60 * 1e3;
            if (timeDiff < fourHours) {
              canDraw.value = false;
              remainingTimes.value = 0;
              nextDrawTime.value = new Date(lastDrawTime.getTime() + fourHours);
            } else {
              canDraw.value = true;
              remainingTimes.value = 1;
              nextDrawTime.value = null;
            }
          }
        } else {
          resetDailyData();
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/index/index.vue:285", "检查抽奖状态失败:", error);
        resetDailyData();
      }
    }
    function resetDailyData() {
      canDraw.value = true;
      remainingTimes.value = 1;
      nextDrawTime.value = null;
      todayResults.value = [];
      countdownText.value = "";
      const today = formatDate(/* @__PURE__ */ new Date());
      const data = {
        date: today,
        results: [],
        // 每日重置为空数组
        lastDrawTime: null
      };
      common_vendor.index.setStorageSync("lottery_data", JSON.stringify(data));
    }
    function startCountdown() {
      setInterval(() => {
        if (nextDrawTime.value && !canDraw.value) {
          const timeDiff = nextDrawTime.value.getTime() - (/* @__PURE__ */ new Date()).getTime();
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
    function startLottery() {
      if (!canDraw.value || remainingTimes.value <= 0) {
        if (countdownText.value) {
          common_vendor.index.__f__("log", "at pages/index/index.vue:335", `抽奖冷却中，请等待 ${countdownText.value} 后再试！`);
        } else {
          common_vendor.index.__f__("log", "at pages/index/index.vue:337", "今日抽奖次数已用完，请明日再来！");
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
      const currentPos = currentIndex.value === -1 ? 0 : currentIndex.value;
      const targetPos = winnerIndex.value;
      const stepsToTarget = targetPos >= currentPos ? targetPos - currentPos : 8 - currentPos + targetPos;
      const totalSpins = baseSpins + stepsToTarget;
      const spinInterval = setInterval(() => {
        currentIndex.value = (currentIndex.value + 1) % 8;
        spinCount++;
        if (spinCount >= totalSpins + 1) {
          clearInterval(spinInterval);
          setTimeout(() => {
            isSpinning.value = false;
            showResult.value = true;
            showResultModal.value = true;
            saveLotteryResult(result);
            canDraw.value = false;
            remainingTimes.value = 0;
            nextDrawTime.value = new Date((/* @__PURE__ */ new Date()).getTime() + 4 * 60 * 60 * 1e3);
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
      } else if (random < prizeProbabilities.free + prizeProbabilities.cash5 + prizeProbabilities.cash3 + prizeProbabilities.cash2) {
        selectedType = "cash2";
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
    function formatDate(date) {
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const hour = date.getHours();
      const minute = date.getMinutes().toString().padStart(2, "0");
      const second = date.getSeconds().toString().padStart(2, "0");
      return `${year}/${month}/${day} ${hour}:${minute}:${second}`;
    }
    function saveLotteryResult(result) {
      try {
        const today = formatDate(/* @__PURE__ */ new Date());
        const lotteryData = common_vendor.index.getStorageSync("lottery_data");
        let data = {
          date: today,
          results: [],
          lastDrawTime: null
        };
        if (lotteryData) {
          const existingData = JSON.parse(lotteryData);
          if (existingData.date === today) {
            data = existingData;
          }
        }
        const newResult = {
          icon: result.prize.icon,
          // 使用奖品的正确图标
          name: result.prize.name,
          type: result.prize.type,
          amount: result.amount || 0,
          time: (/* @__PURE__ */ new Date()).toLocaleString(),
          timestamp: (/* @__PURE__ */ new Date()).getTime()
        };
        data.results = [newResult];
        data.lastDrawTime = (/* @__PURE__ */ new Date()).toISOString();
        common_vendor.index.setStorageSync("lottery_data", JSON.stringify(data));
        todayResults.value = data.results;
        const historyRecord = {
          ...newResult,
          isFree: result.type === "none" ? false : true
        };
        lotteryHistory.value.push(historyRecord);
        common_vendor.index.__f__("log", "at pages/index/index.vue:506", "🎲 抽奖结果记录:", {
          时间: historyRecord.time,
          结果: historyRecord.name,
          类型: historyRecord.type === "money" ? "红包奖励" : "谢谢参与",
          金额: historyRecord.amount || 0,
          图标: historyRecord.icon
        });
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/index/index.vue:514", "保存抽奖结果失败:", error);
      }
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
        h: common_assets._imports_0,
        i: common_vendor.f(luckTexts.value, (text, index, i0) => {
          return {
            a: common_vendor.t(text.content),
            b: text.id,
            c: index * 0.1 + "s"
          };
        }),
        j: common_vendor.o(tapBeast),
        k: beastTapped.value ? 1 : "",
        l: common_vendor.t(prizes.value[0].icon),
        m: common_vendor.t(prizes.value[0].name),
        n: currentIndex.value === 0 && isSpinning.value ? 1 : "",
        o: winnerIndex.value === 0 && showResult.value ? 1 : "",
        p: common_vendor.t(prizes.value[1].icon),
        q: common_vendor.t(prizes.value[1].name),
        r: currentIndex.value === 1 && isSpinning.value ? 1 : "",
        s: winnerIndex.value === 1 && showResult.value ? 1 : "",
        t: common_vendor.t(prizes.value[2].icon),
        v: common_vendor.t(prizes.value[2].name),
        w: currentIndex.value === 2 && isSpinning.value ? 1 : "",
        x: winnerIndex.value === 2 && showResult.value ? 1 : "",
        y: common_vendor.t(prizes.value[7].icon),
        z: common_vendor.t(prizes.value[7].name),
        A: currentIndex.value === 7 && isSpinning.value ? 1 : "",
        B: winnerIndex.value === 7 && showResult.value ? 1 : "",
        C: !canDraw.value && countdownText.value
      }, !canDraw.value && countdownText.value ? {
        D: common_vendor.t(countdownText.value)
      } : !canDraw.value ? {} : isSpinning.value ? {} : {}, {
        E: !canDraw.value,
        F: isSpinning.value,
        G: common_vendor.t(remainingTimes.value),
        H: common_vendor.o(startLottery),
        I: !canDraw.value || isSpinning.value,
        J: common_vendor.t(prizes.value[3].icon),
        K: common_vendor.t(prizes.value[3].name),
        L: currentIndex.value === 3 && isSpinning.value ? 1 : "",
        M: winnerIndex.value === 3 && showResult.value ? 1 : "",
        N: common_vendor.t(prizes.value[6].icon),
        O: common_vendor.t(prizes.value[6].name),
        P: currentIndex.value === 6 && isSpinning.value ? 1 : "",
        Q: winnerIndex.value === 6 && showResult.value ? 1 : "",
        R: common_vendor.t(prizes.value[5].icon),
        S: common_vendor.t(prizes.value[5].name),
        T: currentIndex.value === 5 && isSpinning.value ? 1 : "",
        U: winnerIndex.value === 5 && showResult.value ? 1 : "",
        V: common_vendor.t(prizes.value[4].icon),
        W: common_vendor.t(prizes.value[4].name),
        X: currentIndex.value === 4 && isSpinning.value ? 1 : "",
        Y: winnerIndex.value === 4 && showResult.value ? 1 : "",
        Z: todayResults.value.length > 0
      }, todayResults.value.length > 0 ? {
        aa: common_vendor.t(todayResults.value[0].icon),
        ab: common_vendor.t(todayResults.value[0].name)
      } : {}, {
        ac: showResultModal.value
      }, showResultModal.value ? {
        ad: common_vendor.t(winResult.value.icon),
        ae: common_vendor.t(winResult.value.title),
        af: common_vendor.t(winResult.value.description),
        ag: common_vendor.o(closeResultModal),
        ah: common_vendor.o(() => {
        }),
        ai: common_vendor.o(closeResultModal)
      } : {}, {
        aj: !pageLoading.value,
        ak: common_vendor.n(pcFlag.value ? "activity-pc" : "")
      });
    };
  }
});
_sfc_defineComponent.__runtimeHooks = 2;
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_defineComponent, [["__scopeId", "data-v-1cf27b2a"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/index/index.js.map
