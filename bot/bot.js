import { Telegraf } from "telegraf";

const bot = new Telegraf("7842494100:AAFzOA_AwZEr-titLsOozCAz2thcYdfu3GE");

bot.start((ctx) => {
  ctx.reply("Натисни кнопку, щоб відкрити додаток 👇", {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "Відкрити Mini App",
            web_app: {
              url: "https://service-bot-ten.vercel.app", // твій фронт
            },
          },
        ],
      ],
    },
  });
});

// Опціонально: додай кнопку в меню (працює на мобілках)
bot.command("menu", async (ctx) => {
  await ctx.setChatMenuButton({
    type: "web_app",
    text: "Записатися",
    web_app: { url: "https://service-bot-ten.vercel.app" },
  });

  await ctx.reply("Кнопку додано в меню чату.");
});

bot.launch().then(() => {
  console.log("✅ Бот запущено");
});
