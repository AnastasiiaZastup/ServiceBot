import { Telegraf } from "telegraf";

const bot = new Telegraf("7842494100:AAFzOA_AwZEr-titLsOozCAz2thcYdfu3GE");

bot.start((ctx) => {
  ctx.reply("Натисни кнопку, щоб відкрити додаток 👇", {
    reply_markup: {
      keyboard: [
        [
          {
            text: "Відкрити Mini App",
            web_app: {
              url: "http://localhost:61243",
            },
          },
        ],
      ],
      resize_keyboard: true,
      one_time_keyboard: true,
    },
  });
});

bot.launch().then(() => {
  console.log("✅ Бот запущено");
});
