// SC BY MIFTAH GANZZ
// YANG APUS YTEAM :v
// YANG JUAL INGAT NERAKA MENUNGGU MU
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const { botToken, lolHumanApiKey, ownerContact, qrisImage, badword } = require('./config');

const bot = new TelegramBot(botToken, { polling: true });

let activeAiMode = '';
let activeAiStopButton = '';
// Mendapatkan nama pengguna dari objek pesan
function getUserName(msg) {
  return msg.from.first_name;
}

// Mendapatkan pesan waktu berdasarkan zona waktu GMT+7
function getGreetingMessage() {
  const now = new Date().getHours() + 7; // Menambahkan offset waktu GMT+7 (7 jam)
  if (now >= 0 && now < 6) {
    return 'udah malam belum tidur?';
  } else if (now >= 6 && now < 12) {
    return 'Selamat Pagi!';
  } else if (now >= 12 && now < 15) {
    return 'Selamat Siang!';
  } else if (now >= 15 && now < 18) {
    return 'Selamat Sore!';
  } else {
    return 'Selamat Malam!';
  }
}

// Mendengarkan perintah /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const options = {
    reply_markup: {
      keyboard: [
        ['OpenAI Turbo', 'Simi'],
        ['OpenAI', 'Stop']
      ],
      resize_keyboard: true,
      one_time_keyboard: true
    }
  };
  const userName = getUserName(msg);
  const greetingMessage = getGreetingMessage();
  bot.sendMessage(chatId, `Halo ${userName}! ${greetingMessage} Pilih salah satu opsi:`, options);
});

bot.onText(/OpenAI Turbo/, (msg) => {
  const chatId = msg.chat.id;
  activeAiMode = 'openaiturbo';
  activeAiStopButton = '/stop_openaiturbo';
  bot.sendMessage(chatId, 'Mode OpenAI Turbo telah dipilih.');
});

bot.onText(/Simi/, (msg) => {
  const chatId = msg.chat.id;
  activeAiMode = 'simi';
  activeAiStopButton = '/stop_simi';
  bot.sendMessage(chatId, 'Mode Simi telah dipilih.');
});

bot.onText(/OpenAI/, (msg) => {
  const chatId = msg.chat.id;
  activeAiMode = 'openai';
  activeAiStopButton = '/stop_openai';
  bot.sendMessage(chatId, 'Mode OpenAI telah dipilih.');
});

bot.onText(/Stop/, (msg) => {
  const chatId = msg.chat.id;
  activeAiMode = '';
  activeAiStopButton = '';
  console.log(`[USER ${msg.from.first_name} ID:${chatId}] menghentikan AI.`);
  bot.sendMessage(chatId, 'AI telah dihentikan.');
});

bot.onText(/\/owner/, (msg) => {
  const chatId = msg.chat.id;
  console.log(`[USER ${msg.from.first_name} ID:${chatId}] meminta informasi kontak owner.`);
  bot.sendContact(chatId, ownerContact.phoneNumber, ownerContact.firstName, { last_name: ownerContact.lastName });
});

bot.onText(/\/donasi/, (msg) => {
  const chatId = msg.chat.id;
  console.log(`[USER ${msg.from.first_name} ID:${chatId}] meminta informasi donasi.`);
  bot.sendPhoto(chatId, qrisImage, { caption: 'Terima kasih atas donasi Anda. Silakan scan QRIS di bawah ini untuk melakukan pembayaran.' });
});

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (activeAiMode === 'openaiturbo') {
    try {
      const response = await axios.get('https://api.lolhuman.xyz/api/openai-turbo', {
        params: {
          apikey: lolHumanApiKey,
          text: text,
          system: 'gpt-3.5-turbo',
        },
      });

      const answer = response.data.result;
      bot.sendMessage(chatId, answer);
    } catch (error) {
      console.error(error);
      bot.sendMessage(chatId, 'Maaf, terjadi kesalahan saat memproses permintaan Anda.');
    }
  } else if (activeAiMode === 'simi') {
    try {
      const response = await axios.get('https://api.lolhuman.xyz/api/simi', {
        params: {
          apikey: lolHumanApiKey,
          text: text,
          badword: badword,
        },
      });

      const answer = response.data.result;
      bot.sendMessage(chatId, answer);
    } catch (error) {
      console.error(error);
      bot.sendMessage(chatId, 'Maaf, terjadi kesalahan saat memproses permintaan Anda.');
    }
  } else if (activeAiMode === 'openai') {
    try {
      const response = await axios.get('https://api.lolhuman.xyz/api/openai', {
        params: {
          apikey: lolHumanApiKey,
          text: text,
          user: 'user-unique-id',
        },
      });

      const answer = response.data.result;
      bot.sendMessage(chatId, answer);
    } catch (error) {
      console.error(error);
      bot.sendMessage(chatId, 'Maaf, terjadi kesalahan saat memproses permintaan Anda.');
    }
  }
});

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (activeAiMode === 'openaiturbo') {
    console.log(`[USER ${msg.from.first_name} ID:${chatId}] use mode OpenAI Turbo: ${text}`);
    // Lakukan pemrosesan AI OpenAI Turbo
  } else if (activeAiMode === 'simi') {
    console.log(`[USER ${msg.from.first_name} ID:${chatId}] use mode Simi: ${text}`);
    // Lakukan pemrosesan AI Simi
  } else if (activeAiMode === 'openai') {
    console.log(`[USER ${msg.from.first_name} ID:${chatId}] use mode OpenAI: ${text}`);
    // Lakukan pemrosesan AI OpenAI
  } else {
    console.log(`[USER ${msg.from.first_name} ID:${chatId}] send text: ${text}`);
    // Lakukan pemrosesan pesan tanpa AI
  }
});

bot.on('polling_error', (error) => {
  console.error(error);
});

console.log('Bot sedang berjalan...');
