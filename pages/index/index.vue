<template>
  <div :class="pcFlag ? 'activity-pc' : ''" >
    <!-- 后续继续新增内容：改为微信小程序接入微信用户 展示累计中奖金额、中奖用户的数据滚动 -->
    <div class="center-area">
      <van-loading v-show="pageLoading" size="48px" vertical class="pageLoading flex-center"></van-loading>
      <div class="lottery-container" v-show="!pageLoading">
    <!-- 顶部横幅 -->
    <div class="top-banner">
      <div class="banner-img" @click="shareShow = true"></div>
      <div class="banner-title">
        <h2>测测你的今日好运!</h2>
        <p class="subtitle">好运总概率 <span class="highlight-rate">98%</span></p>
      </div>
    </div>
    
    <!-- 概率公示 -->
    <div class="probability-info">
      <div class="prob-title">概率公示</div>
      <div class="prob-grid">
        <div class="prob-item prob-free">
          <span class="prob-name">大奖</span>
          <span class="prob-rate">{{ prizeProbabilities.free + 2 }}%</span>
        </div>
        <div class="prob-item prob-cash">
          <span class="prob-name">加餐</span>
          <span class="prob-rate">{{ prizeProbabilities.cash5 }}%</span>
        </div>
        <div class="prob-item prob-cash">
          <span class="prob-name">快乐水</span>
          <span class="prob-rate">{{ prizeProbabilities.cash3 }}%</span>
        </div>
        <div class="prob-item prob-paid">
          <span class="prob-name">再接再厉</span>
          <span class="prob-rate">{{ prizeProbabilities.paid - 2 }}%</span>
        </div>
      </div>
    </div>
    
    <!-- 悬浮木鱼 -->
    <div class="floating-beast" @click="tapBeast" :class="{ 'tapped': beastTapped }">
		<div class="beast-icon">
			<img class="icon-img" src="../../static/muyu.svg" alt="">
		</div>
		<div v-for="(text, index) in luckTexts" :key="text.id" class="luck-text" :style="{ animationDelay: index * 0.1 + 's' }">{{ text.content }}</div>
    </div>

    <!-- 九宫格抽奖 -->
    <div class="lottery-grid stable">
      <!-- 第一行 -->
      <div 
        class="prize-item"
        :class="{
          'active': currentIndex === 0 && isSpinning,
          'winner': winnerIndex === 0 && showResult
        }"
      >
        <div class="prize-icon">{{ prizes[0].icon }}</div>
        <div class="prize-name">{{ prizes[0].name }}</div>
      </div>
      <div 
        class="prize-item"
        :class="{
          'active': currentIndex === 1 && isSpinning,
          'winner': winnerIndex === 1 && showResult
        }"
      >
        <div class="prize-icon">{{ prizes[1].icon }}</div>
        <div class="prize-name">{{ prizes[1].name }}</div>
      </div>
      <div 
        class="prize-item"
        :class="{
          'active': currentIndex === 2 && isSpinning,
          'winner': winnerIndex === 2 && showResult
        }"
      >
        <div class="prize-icon">{{ prizes[2].icon }}</div>
        <div class="prize-name">{{ prizes[2].name }}</div>
      </div>
      
      <!-- 第二行 -->
      <div 
        class="prize-item"
        :class="{
          'active': currentIndex === 7 && isSpinning,
          'winner': winnerIndex === 7 && showResult
        }"
      >
        <div class="prize-icon">{{ prizes[7].icon }}</div>
        <div class="prize-name">{{ prizes[7].name }}</div>
      </div>
      
      <!-- 中央抽奖按钮 -->
      <div class="lottery-center">
        <button 
          class="lottery-btn" 
          @click="startLottery" 
          :disabled="!canDraw || isSpinning"
        >
          <span v-if="!canDraw && countdownText">{{ countdownText }}</span>
          <span v-else-if="!canDraw">今日已抽奖</span>
          <span v-else-if="isSpinning">抽奖中...</span>
          <span v-else>开始抽奖</span>
          <span style="font-size:10px;margin-top: 10px;">剩余:{{ remainingTimes }} 次</span>
        </button>
      </div>
      
      <div 
        class="prize-item"
        :class="{
          'active': currentIndex === 3 && isSpinning,
          'winner': winnerIndex === 3 && showResult
        }"
      >
        <div class="prize-icon">{{ prizes[3].icon }}</div>
        <div class="prize-name">{{ prizes[3].name }}</div>
      </div>
      
      <!-- 第三行 -->
      <div 
        class="prize-item"
        :class="{
          'active': currentIndex === 6 && isSpinning,
          'winner': winnerIndex === 6 && showResult
        }"
      >
        <div class="prize-icon">{{ prizes[6].icon }}</div>
        <div class="prize-name">{{ prizes[6].name }}</div>
      </div>
      <div 
        class="prize-item"
        :class="{
          'active': currentIndex === 5 && isSpinning,
          'winner': winnerIndex === 5 && showResult
        }"
      >
        <div class="prize-icon">{{ prizes[5].icon }}</div>
        <div class="prize-name">{{ prizes[5].name }}</div>
      </div>
      <div 
        class="prize-item"
        :class="{
          'active': currentIndex === 4 && isSpinning,
          'winner': winnerIndex === 4 && showResult
        }"
      >
        <div class="prize-icon">{{ prizes[4].icon }}</div>
        <div class="prize-name">{{ prizes[4].name }}</div>
      </div>
    </div>

    <!-- 今日已抽奖提示 -->
     <div class="today-result" v-if="todayResults.length > 0">
       <h3>上次测试结果</h3>
       <div class="result-display">
         <div class="result-icon">{{ todayResults[0].icon }}</div>
         <div class="result-text">{{ todayResults[0].name }}</div>
         <!-- <div class="result-time">{{ todayResults[0].time }}</div> -->
       </div>
     </div>

    <!-- 结果弹窗 -->
    <div class="result-modal" v-if="showResultModal" @click="closeResultModal">
      <div class="modal-content" @click.stop>
        <div class="result-card">
          <div class="result-icon-large">{{ winResult.icon }}</div>
          <h2>{{ winResult.title }}</h2>
          <p>{{ winResult.description }}</p>
          <button class="close-btn" @click="closeResultModal">确定</button>
        </div>
      </div>
    </div>
      </div>
    </div>
  </div>

</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onShareAppMessage } from '@dcloudio/uni-app'

// 响应式数据
const pcFlag = ref(false)
const pageLoading = ref(true)
const canDraw = ref(true)
const remainingTimes = ref(1)
const nextDrawTime = ref(null)
const countdownText = ref('')
const lotteryHistory = ref([])
const isSpinning = ref(false)
const showResultModal = ref(false)
const currentIndex = ref(-1)
const winnerIndex = ref(-1)
const showResult = ref(false)
const todayResults = ref([])
const winResult = ref({})
const shareShow = ref(false) // 分享弹窗

// 神兽相关状态
const beastTapped = ref(false)
const luckTexts = ref([])
const luckCount = ref(0)
let luckTextId = 0

// 奖品配置（八个奖品围绕中央按钮，按指定位置排列）
const prizes = ref([
  { icon: '🍱', name: '5元盒饭加餐', type: 'cash5' },
  { icon: '😭', name: '再接再励', type: 'paid' },
  { icon: '🥤', name: '3元快乐水', type: 'cash3' },
  { icon: '🥤', name: '3元快乐水', type: 'cash3' },
  { icon: '🥤', name: '3元快乐水', type: 'cash3' },
  { icon: '🎁', name: '清空购物车', type: 'free' },
  { icon: '🍱', name: '5元盒饭加餐', type: 'cash5' },
  { icon: '🍱', name: '5元盒饭加餐', type: 'cash5' },
])

// 奖品概率配置 (返现率控制在18%左右，概率与返现金额成反比)
  const prizeProbabilities = {
    free: 6,      // 免单 6% (最高价值30元，最低概率)
    cash5: 40,    // 五元红包 40% (中等价值，中等概率)
    cash3: 50,    // 三元红包 50% (较低价值，较高概率)
    paid: 4      // 收费 4%
  }

// 页面加载时检查抽奖状态
onMounted(() => {
  checkLotteryStatus()
  startCountdown()
  setTimeout(() => {
    pageLoading.value = false;
  }, 200);
})


onShareAppMessage(()=>{
	return {
	  title: '抽奖赢免单',
	  path: '/pages/index/inde',
	  imageUrl:'https://imgs.3dmgame.com/community/402ee1ae5daf455c99eb3c31c3c14f7d11762507624256.png'
	}
})

// 检查抽奖状态（四小时间隔）
function checkLotteryStatus() {
  try {
    
    const today = formatDate(new Date())
    // const lotteryData = localStorage.getItem('lottery_data')  VUE原生JS写法
    const lotteryData = uni.getStorageSync('lottery_data')  // 	 迁移uniapp写法
    
    if (lotteryData) {
      const data = JSON.parse(lotteryData)
      
      // 如果不是今天的数据，重置所有状态
      if (data.date !== today) {
        resetDailyData()
        return
      }
      
      // 加载今日抽奖记录
      todayResults.value = data.results || []
      
      // 检查是否可以抽奖
      if (data.lastDrawTime) {
        const lastDrawTime = new Date(data.lastDrawTime)
        const timeDiff = new Date().getTime() - lastDrawTime.getTime()
        const fourHours = 4 * 60 * 60 * 1000 // 4小时的毫秒数
        
        if (timeDiff < fourHours) {
          canDraw.value = false
          remainingTimes.value = 0
          nextDrawTime.value = new Date(lastDrawTime.getTime() + fourHours)
        } else {
          canDraw.value = true
          remainingTimes.value = 1
          nextDrawTime.value = null
        }
      }
    } else {
      // 首次使用，初始化数据
      resetDailyData()
    }
  } catch (error) {
    console.error('检查抽奖状态失败:', error)
    resetDailyData()
  }
}

// 重置每日数据
function resetDailyData() {
  canDraw.value = true
  remainingTimes.value = 1
  nextDrawTime.value = null
  todayResults.value = []
  countdownText.value = ''
  
  const today = formatDate(new Date())
  const data = {
    date: today,
    results: [], // 每日重置为空数组
    lastDrawTime: null
  }
  uni.setStorageSync('lottery_data', JSON.stringify(data))
}

// 开始倒计时
function startCountdown() {
  setInterval(() => {
    if (nextDrawTime.value && !canDraw.value) {
      const now = new Date()
      const timeDiff = nextDrawTime.value.getTime() - new Date().getTime()
      
      if (timeDiff <= 0) {
        // 倒计时结束，可以抽奖了
        canDraw.value = true
        remainingTimes.value = 1
        nextDrawTime.value = null
        countdownText.value = ''
      } else {
        // 更新倒计时显示
        const hours = Math.floor(timeDiff / (1000 * 60 * 60))
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000)
        countdownText.value = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      }
    }
  }, 1000)
}

// 开始抽奖
function startLottery() {
  if (!canDraw.value || remainingTimes.value <= 0) {
    if (countdownText.value) {
      console.log(`抽奖冷却中，请等待 ${countdownText.value} 后再试！`)
    } else {
      console.log('今日抽奖次数已用完，请明日再来！')
    }
    return
  }
  
  if (isSpinning.value) return
  
  isSpinning.value = true
  showResult.value = false
  
  // 确定中奖结果
  const result = generateLotteryResult()
  winnerIndex.value = result.index
  winResult.value = result.prize
  
  // 开始转动动画
  let spinCount = 0
  const baseSpins = 16 // 基础转动次数（2圈）
  // 计算从当前位置到目标位置需要的步数
  const currentPos = currentIndex.value === -1 ? 0 : currentIndex.value
  const targetPos = winnerIndex.value
  const stepsToTarget = targetPos >= currentPos ? targetPos - currentPos : 8 - currentPos + targetPos
  
  const totalSpins = baseSpins + stepsToTarget
  
  const spinInterval = setInterval(() => {
    currentIndex.value = (currentIndex.value + 1) % 8
    spinCount++
    
    if (spinCount >= totalSpins + 1) {
      clearInterval(spinInterval)
      // 此时currentIndex已经自然停在winnerIndex位置
      
      setTimeout(() => {
          isSpinning.value = false
          showResult.value = true
          showResultModal.value = true
          saveLotteryResult(result)
          
          // 更新抽奖状态
          canDraw.value = false
          remainingTimes.value = 0
          const now = new Date()
          nextDrawTime.value = new Date(new Date().getTime() + 4 * 60 * 60 * 1000) // 4小时后
        }, 500)
    }
  }, 100)
}

// 生成抽奖结果
function generateLotteryResult() {
  const random = Math.random() * 100
  let selectedType = 'paid'
  
  // 根据概率确定奖品类型
  if (random < prizeProbabilities.free) {
    selectedType = 'free'
  } else if (random < prizeProbabilities.free + prizeProbabilities.cash5) {
    selectedType = 'cash5'
  } else if (random < prizeProbabilities.free + prizeProbabilities.cash5 + prizeProbabilities.cash3) {
    selectedType = 'cash3'
  } else if (random < prizeProbabilities.free + prizeProbabilities.cash5 + prizeProbabilities.cash3 + prizeProbabilities.cash2) {
    selectedType = 'cash2'
  } else {
    selectedType = 'paid'
  }
  
  // 获取对应类型的奖品
  const availablePrizes = prizes.value
    .map((prize, index) => ({ ...prize, index }))
    .filter(prize => prize.type === selectedType)
  
  // 随机选择一个奖品
  const selectedPrize = availablePrizes[Math.floor(Math.random() * availablePrizes.length)]
  
  // 根据奖品类型设置标题和描述
  let title, description
  switch (selectedType) {
    case 'free':
      title = '🎉今日运气爆棚!'
      description = '随心所欲买买买~'
      break
    case 'cash5':
      title = '🍚五元午饭加餐!'
      description = '吃饱饱，吃好好~'
      break
    case 'cash3':
      title = '🥤3元快乐水!'
      description = '快乐不简单~'
      break
    default:
      title = '再接再励!'
      description = '平平淡淡才是真~'
  }
  
  return {
    index: selectedPrize.index,
    prize: {
      icon: selectedPrize.icon,
      title: title,
      description: description,
      name: selectedPrize.name,
      type: selectedPrize.type
    }
  }
}

// 自定义格式化函数 格式化规则不交给​​不确定的运行环境
function formatDate(date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // 月份从0开始，要加1
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes().toString().padStart(2, '0'); // 补零
  const second = date.getSeconds().toString().padStart(2, '0');

  // 拼接成您需要的格式，例如 "2025/11/7 15:54:36"
  return `${year}/${month}/${day} ${hour}:${minute}:${second}`;
}

// 保存抽奖结果
function saveLotteryResult(result) {
  try {
    const today = formatDate(new Date())
    
    // 获取现有数据
    const lotteryData = uni.getStorageSync("lottery_data")
    let data = {
      date: today,
      results: [],
      lastDrawTime: null
    }
    
    if (lotteryData) {
      const existingData = JSON.parse(lotteryData)
      if (existingData.date === today) {
        data = existingData
      }
    }
    
    // 添加新的抽奖结果（只保留最后一次）
    const newResult = {
      icon: result.prize.icon, // 使用奖品的正确图标
      name: result.prize.name,
      type: result.prize.type,
      amount: result.amount || 0,
      time: new Date().toLocaleString(),
      timestamp: new Date().getTime()
    }
    
    // 只保留最后一次抽奖结果
    data.results = [newResult]
    data.lastDrawTime = new Date().toISOString()
    
    // 保存到本地存储
    // localStorage.setItem('lottery_data', JSON.stringify(data))
	uni.setStorageSync('lottery_data', JSON.stringify(data))
    
    // 更新页面状态
    todayResults.value = data.results
    
    // 记录到历史记录
    const historyRecord = {
      ...newResult,
      isFree: result.type === 'none' ? false : true
    }
    lotteryHistory.value.push(historyRecord)
    
    // 控制台输出中奖结果
    console.log('🎲 抽奖结果记录:', {
      时间: historyRecord.time,
      结果: historyRecord.name,
      类型: historyRecord.type === 'money' ? '红包奖励' : '谢谢参与',
      金额: historyRecord.amount || 0,
      图标: historyRecord.icon
    })
  } catch (error) {
    console.error('保存抽奖结果失败:', error)
  }
}



// 显示提示信息
function showToast(message) {
  // 简单的提示实现，可以根据项目需要替换为更好的提示组件
  alert(message)
}

// 关闭结果弹窗
function closeResultModal() {
  showResultModal.value = false
}

// 关闭分享弹窗
const clickCloseFunc = (bool) => {
  shareShow.value = bool;
}

// 点击神兽增加好运
function tapBeast() {
  // 触发点击动效
  beastTapped.value = true
  luckCount.value++
  
  // 随机选择文案
  const luckMessages = ['功德+1', '好运+1', '财运+1']
  const randomMessage = luckMessages[Math.floor(Math.random() * luckMessages.length)]
  
  // 添加新的功德文字
  const newLuckText = { id: ++luckTextId, content: randomMessage }
  luckTexts.value.push(newLuckText)
  
  // 重置动效状态
  setTimeout(() => {
    beastTapped.value = false
  }, 300)
  
  // 1.5秒后移除功德文字
  setTimeout(() => {
    const index = luckTexts.value.findIndex(text => text.id === newLuckText.id)
    if (index > -1) {
      luckTexts.value.splice(index, 1)
    }
  }, 1500)
}
</script>

<style scoped lang="scss">
.center-area {
	-webkit-tap-highlight-color: rgba(0, 0, 0, 0);
	-webkit-tap-highlight-color: transparent; /* 同上，两种写法任选其一即可 */
}
/* 加载动画样式 */
.pageLoading {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom, #ffcb05 0%, #fdf6e0 30%, #fff 100%);
  z-index: 9999;
}

.flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

.center-area {
  max-width: 750rpx;
  margin: 0 auto;
  background-color: #fff;
  position: relative;
}
.lottery-container {
  // width: 100vw; 
  max-width: 750rpx;
  min-height: 100vh;
  background: linear-gradient(to bottom, #ffcb05 0%, #fdf6e0 30%, #fff 100%);
  padding: 120rpx 30rpx 200rpx 30rpx;
  color: #333;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  overflow: hidden;
}

/* 顶部横幅样式 */
.top-banner {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  overflow: hidden;
  margin-bottom: 40rpx;
}

.banner-img{
  width: 266rpx;
  height: 230rpx;
  background-image: url(../../static/lottery.png);
  background-repeat: no-repeat;
  background-size: 100% auto;
  flex-shrink: 0;
}

.banner-title {
  height: 230rpx;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.banner-title h1 {
  font-size: 56rpx;
  font-weight: bold;
  color: #000;
  text-shadow: 4rpx 4rpx 8rpx rgba(0,0,0,0.3);
  margin: 0;
  text-align: center;
}

.subtitle {
  margin-top: 28rpx;
  text-align: center;
  font-size: 28rpx;
}

/* 中奖滚动区域样式 */
.winner-scroll {
  width: 100%;
  max-width: 700rpx;
  height: 100rpx;
  background: rgba(255,255,255,0.9);
  border-radius: 20rpx;
  margin-bottom: 30rpx;
  overflow: hidden;
  position: relative;
  display: flex;
  align-items: center;
  padding: 0 30rpx;
  box-shadow: 0 8rpx 24rpx rgba(0,0,0,0.1);
}

.scroll-item {
  display: flex;
  align-items: center;
  white-space: nowrap;
  animation: scrollLeft 15s linear infinite;
  min-width: 100%;
}

.winner-avatar {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  margin-right: 16rpx;
}

.winner-name {
  color: #333;
  font-size: 28rpx;
  margin-right: 16rpx;
}

.winner-action {
  color: #666;
  font-size: 28rpx;
  margin-right: 16rpx;
}

.winner-prize {
  color: #FF4500;
  font-size: 28rpx;
  font-weight: bold;
}

@keyframes starTwinkle {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.2); opacity: 0.8; }
}

@keyframes scrollLeft {
  0% { transform: translateX(100%); }
  100% { transform: translateX(-100%); }
}

/* 概率公示样式 */
.probability-info {
  position: relative;
  width: 70vw;
  margin: 8rpx auto 20rpx;
  padding: 8rpx 8rpx 16rpx 8rpx;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(16rpx);
  border-radius: 16rpx;
  border: 2rpx solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 8rpx 30rpx rgba(0,0,0,0.08);
}


.prob-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  text-align: center;
  margin-bottom: 6rpx;
}

.prob-grid {
  display: flex;
  gap: 4rpx;
  justify-content: space-between;
}

.prob-item {
  flex: 1;
  padding: 4rpx 6rpx;
  border-radius: 8rpx;
  text-align: center;
  backdrop-filter: blur(10rpx);
  border: 2rpx solid rgba(255, 255, 255);
}

.prob-free {
     background: linear-gradient(45deg, rgba(255, 215, 0, 0.6), rgba(255, 237, 78, 0.6));
     border: 2rpx solid rgba(255, 215, 0, 0.7);
     color: #333;
   }

   .prob-cash {
     background: linear-gradient(135deg, rgba(255, 68, 68, 0.5), rgba(255, 102, 102, 0.5));
     border: 2rpx solid rgba(255, 68, 68, 0.7);
     color: #fff;
   }

   .prob-paid {
     background: linear-gradient(135deg, rgba(240, 240, 240, 0.6), rgba(224, 224, 224, 0.6));
     border: 2rpx solid rgba(204, 204, 204, 0.7);
     color: #333;
   }

.prob-name {
    display: block;
    font-size: 18rpx;
    line-height: 1.0;
    margin-bottom: 2rpx;
    font-weight: 500;
  }

  .prob-rate {
    display: block;
    font-size: 20rpx;
    font-weight: 600;
    line-height: 1;
  }


.lottery-grid {
  margin-bottom: 15px;
  border-radius: 15px;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 15px rgba(0,0,0,0.08);
  border: 2px solid rgba(255,255,255,0.3);
}

.prize-item {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 20rpx;
  padding: 12rpx 8rpx;
  text-align: center;
  transition: all 0.3s ease;
  border: 4rpx solid rgba(255,215,0,0.3);
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  box-shadow: 0 8rpx 24rpx rgba(0,0,0,0.1);
}

.prize-item.active {
  background: rgba(255, 215, 0, 0.8);
  border-color: #ffd700;
  transform: scale(1.05);
  box-shadow: 0 0 30rpx rgba(255, 215, 0, 0.6);
}

.prize-item.winner { 
  background: rgba(255, 0, 0, 0.8);
  border-color: #ff0000;
  animation: winnerPulse 1s ease-in-out infinite;
}

.prize-item:nth-child(8) {
  background: linear-gradient(45deg, #ffd700, #ffed4e) !important;
  border: 2px solid #ffd700 !important;
  position: relative !important;
  overflow: hidden !important;
}
.prize-item:nth-child(8)::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg, transparent, rgba(255,255,255,0.3), transparent);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
  100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
}

@keyframes winnerPulse {
  0%, 100% { transform: scale(1); box-shadow: 0 0 30rpx rgba(255, 215, 0, 0.6); }
  50% { transform: scale(1.1); box-shadow: 0 0 50rpx rgba(255, 215, 0, 0.8); }
}

.prize-icon {
  font-size: 44rpx;
  margin-bottom: 4rpx;
}

.prize-name {
  font-size: 24rpx;
  font-weight: bold;
  margin-bottom: 2rpx;
  color: #333;
}


.lottery-center {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lottery-btn {
  background: linear-gradient(45deg, #FF4500, #FF6347);
  color: white;
  border: none;
  width: 100%;
  height: 100%;
  font-size: 28rpx;
  font-weight: bold;
  border-radius: 20rpx;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  line-height: 1.2;
  box-shadow: 0 12rpx 30rpx rgba(255,69,0,0.4);
  border: 4rpx solid rgba(255,255,255,0.3);
}

.lottery-btn:hover:not(:disabled) {
  transform: scale(1.05);
  box-shadow: 0 0 30rpx rgba(255, 215, 0, 0.6);
}

.lottery-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}
.today-result {
  background: rgba(255, 255, 2555);
  border-radius: 24rpx;
  padding: 30rpx;
  text-align: center;
  max-width: 560rpx;
  width: 100%;
  backdrop-filter: blur(10px);
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.05);
  border: 2rpx solid rgba(255,255,255,0.2);
}

.today-result h3 {
  margin-bottom: 20rpx;
  font-size: 36rpx;
}

.result-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10rpx;
}

.result-icon {
  font-size: 72rpx;
}

.result-text {
  font-size: 32rpx;
  font-weight: bold;
}

.result-time {
  font-size: 28rpx;
  opacity: 0.7;
}

.highlight-rate {
  color: #ff2f00;
  font-size: 40rpx;
  font-weight: bold;
  border-radius: 12rpx;
}

.result-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: modalFadeIn 0.3s ease;
}

.modal-content {
  max-width: 90%;
  max-height: 90%;
  overflow: auto;
}

.result-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 30rpx;
  padding: 50rpx 40rpx;
  text-align: center;
  color: #333;
  animation: resultSlideIn 0.5s ease;
  min-width: 500rpx;
  max-width: 600rpx;
}

.result-icon-large {
  font-size: 108rpx;
  margin-bottom: 30rpx;
}

.result-card h2 {
  font-size: 48rpx;
  margin: 20rpx 0;
  color: #333;
}

.result-card p {
  font-size: 36rpx;
  margin: 20rpx 0;
  color: #666;
}

.close-btn {
  background: linear-gradient(45deg, #ffd700, #ffed4e);
  color: #333;
  border: none;
  padding: 24rpx 60rpx;
  font-size: 36rpx;
  font-weight: bold;
  border-radius: 50rpx;
  cursor: pointer;
  margin-top: 40rpx;
  transition: all 0.3s ease;
}

/* 悬浮木鱼样式 */
.floating-beast {
  position: fixed;
  top: 40%;
  right: 0rpx;
  width: 120rpx;
  height: 140rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 999;
  animation: floatBeast 3s ease-in-out infinite;
  transition: all 0.3s ease;
  user-select: none;
}



.floating-beast.tapped {
  animation: beastTap 0.3s ease;
}

.beast-icon {
  font-size: 48rpx;
  margin-bottom: 6rpx;
  animation: beastBounce 2s ease-in-out infinite;
  .icon-img{
	  width: 60rpx !important;
	  height: 45rpx !important;
  }
}

.beast-text {
  font-size: 18rpx;
  color: #8B4513;
  font-weight: bold;
  text-align: center;
  line-height: 1.2;
}

.luck-text {
  position: absolute;
  top: -60rpx;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 0, 0, 0.9);
  color: white;
  padding: 8rpx 16rpx;
  border-radius: 12rpx;
  font-size: 24rpx;
  font-weight: bold;
  animation: luckTextShow 1.5s ease-out forwards;
  white-space: nowrap;
}

/* 悬浮动画 */
@keyframes floatBeast {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-3px);
  }
}

/* 神兽图标跳动动画 */
@keyframes beastBounce {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-2px);
  }
}

/* 点击反馈动画 */
@keyframes beastTap {
  0% {
    transform: rotate(0deg);
  }
  50% {
    transform: rotate(-3deg);
  }
  100% {
    transform: rotate(0deg);
  }
}

/* 好运文字显示动画 */
@keyframes luckTextShow {
  0% {
    opacity: 0;
    transform: translateX(-50%) translateY(10px) scale(0.8);
  }
  20% {
    opacity: 1;
    transform: translateX(-50%) translateY(-10px) scale(1.1);
  }
  100% {
    opacity: 0;
    transform: translateX(-50%) translateY(-30px) scale(0.8);
  }
}

/* 稳定九宫格布局，避免微信WebView中的尺寸抖动 */
.lottery-grid.stable {
  --gap: 8px;
  --cell-size: 96px;
  --pad: 12px;
  --border: 2px;
  display: grid;
  grid-template-columns: repeat(3, var(--cell-size));
  grid-template-rows: repeat(3, var(--cell-size));
  grid-template-areas:
    "pos0 pos1 pos2"
    "pos7 center pos3"
    "pos6 pos5 pos4"; 
  gap: var(--gap);
  padding: var(--pad);
  border: var(--border) solid rgba(255,255,255,0.3);
  border-radius: 15px;
  backdrop-filter: none; /* 避免微信WebView因模糊导致重绘抖动 */
  width: calc(var(--cell-size) * 3 + var(--gap) * 2 + var(--pad) * 2 + var(--border) * 2);
  height: calc(var(--cell-size) * 3 + var(--gap) * 2 + var(--pad) * 2 + var(--border) * 2);
  box-sizing: border-box;
}

.lottery-grid.stable > .prize-item,
.lottery-grid.stable > .lottery-center {
  width: var(--cell-size);
  height: var(--cell-size);
  box-sizing: border-box;
}

.lottery-grid.stable > .prize-item {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  background: #fff;
  border: 2px solid #eee;
  border-radius: 12px;
  transition: box-shadow 150ms ease, border-color 150ms ease, background-color 150ms ease;
  /* 防止WebView布局抖动 */
  transform: none !important;
  will-change: auto;
  contain: layout paint size;
}

.lottery-grid.stable > .prize-item.active {
  border-color: #91d5ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.3) inset, 0 4px 10px rgba(24, 144, 255, 0.15);
  background: linear-gradient(180deg, #f7fbff 0%, #ffffff 100%);
}

.lottery-grid.stable > .prize-item.winner {
  border-color: #faad14;
  box-shadow: 0 0 0 2px rgba(250, 173, 20, 0.35) inset, 0 6px 16px rgba(250, 173, 20, 0.2);
  background: linear-gradient(180deg, #fff8e6 0%, #fffdf5 100%);
  transform: none !important;
}

.lottery-grid.stable > .prize-item .prize-icon {
  font-size: 24px;
  line-height: 1;
}

.lottery-grid.stable > .prize-item .prize-name {
  margin-top: 6px;
  font-size: 12px;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: calc(var(--cell-size) - 12px);
}

/* 中央抽奖按钮固定在中心格 */
.lottery-grid.stable > .lottery-center {
  display: flex;
  align-items: center;
  justify-content: center;
  grid-area: center;
}

.lottery-grid.stable > .lottery-center .lottery-btn {
  width: calc(var(--cell-size) - 8px);
  height: calc(var(--cell-size) - 8px);
  border-radius: 12px;
}

/* 根据当前DOM顺序映射到网格区域 */
.lottery-grid.stable > .prize-item:nth-child(1) { grid-area: pos0; }
.lottery-grid.stable > .prize-item:nth-child(2) { grid-area: pos1; }
.lottery-grid.stable > .prize-item:nth-child(3) { grid-area: pos2; }
.lottery-grid.stable > .prize-item:nth-child(4) { grid-area: pos7; }
.lottery-grid.stable > .lottery-center:nth-child(5) { grid-area: center; }
.lottery-grid.stable > .prize-item:nth-child(6) { grid-area: pos3; }
.lottery-grid.stable > .prize-item:nth-child(7) { grid-area: pos6; }
.lottery-grid.stable > .prize-item:nth-child(8) { grid-area: pos5; }
.lottery-grid.stable > .prize-item:nth-child(9) { grid-area: pos4; }
</style>