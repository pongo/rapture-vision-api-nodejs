# rapture-vision-api-nodejs

Распознавалка объектов на фото.

```bash
npm ci
node index.js
```


## api/senya

Проверяет, есть ли senya на фото.

POST-запросом подается json с адресом ссылки на картинку, возвращается json с булевым is_senya.

```
curl -L -X POST "http://localhost:3000/api/senya" -H "Content-Type: application/json" --data-raw "{ \"url\": \"https://picture_url.jpg\" }"

{"ok":true,"is_senya":false}
```

Используется [@vladmandic/face-api](https://www.npmjs.com/package/@vladmandic/face-api), [@tensorflow/tfjs-node](https://www.npmjs.com/package/@tensorflow/tfjs-node) и [canvas](https://www.npmjs.com/package/canvas). Самих моделей распознавания в репозитории нет.

## Проблемы при установке

### Vercel (lambda)

Не получится. У vercel ограничение на размер функции. tfjs-node-lambda дает ошибку "tfjs-converter не найден" (далее не копал). tfjs-node-cpu слишком долго работает, а canvas не ставится.

### ENOMEM при инсталляции

Не хватает памяти. Помогает [включение свопа](https://stackoverflow.com/questions/26193654/node-js-catch-enomem-error-thrown-after-spawn).

### Illegal instruction после запуска

Свежие версии tfjs-node используют инструкции, которых нет на старых процессорах. Придется использовать @tensorflow/tfjs-node@1.2.1 или компилировать tensorflow из исходников.
