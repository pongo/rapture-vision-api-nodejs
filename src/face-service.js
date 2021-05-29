"use strict";

const canvas = require("canvas");
const tf = require("@tensorflow/tfjs-node"); // @tensorflow/tfjs-node@1.2.1
const faceapi = require("@vladmandic/face-api");
const fs = require("fs");
const { timeStart } = require("./utils/time-start");
const { Ok } = require("./utils/result");
const { Err } = require("./utils/result");

const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

const modelPath = "./model/tf_common";
const minConfidence = 0.5;
const maxResults = 10;

let optionsSSDMobileNet;
let initialized = false;
const faceMatchers = new Map();

async function setup() {
  const elapsed = timeStart();
  try {
    await faceapi.tf.setBackend("tensorflow");
    await faceapi.tf.enableProdMode();
    await faceapi.tf.ENV.set("DEBUG", false);
    await faceapi.tf.ready();

    await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelPath);
    await faceapi.nets.faceLandmark68Net.loadFromDisk(modelPath);
    await faceapi.nets.faceRecognitionNet.loadFromDisk(modelPath);
    // await faceapi.nets.ageGenderNet.loadFromDisk(modelPath);
    // await faceapi.nets.faceExpressionNet.loadFromDisk(modelPath);

    optionsSSDMobileNet = new faceapi.SsdMobilenetv1Options({
      minConfidence,
      maxResults,
    });

    console.log(
      `Version: TensorFlow/JS ${faceapi.tf?.version_core} FaceAPI ${
        faceapi.version.faceapi
      } Backend: ${faceapi.tf?.getBackend()}, (${elapsed()} ms)`
    );
    return Ok();
  } catch (error) {
    console.error(`FaceApi setup error: ${error.message} (elapsed ${elapsed()} ms)`, error);
    return Err(`FaceApi setup error: ${error.message}`, { error });
  }
}

async function image(url) {
  const img = await canvas.loadImage(url);
  const c = canvas.createCanvas(img.width, img.height);
  const ctx = c.getContext("2d");
  ctx.drawImage(img, 0, 0, img.width, img.height);
  return c;
}

async function detect(tensor) {
  try {
    // return [ await faceapi.detectSingleFace(tensor, optionsSSDMobileNet).withFaceLandmarks().withFaceDescriptor() ]

    return Ok(
      await faceapi
        .detectAllFaces(tensor, optionsSSDMobileNet)
        .withFaceLandmarks()
        // .withFaceExpressions()
        // .withAgeAndGender()
        .withFaceDescriptors()
    );
  } catch (e) {
    console.error("Detect error", e.message);
    return Err(`Detect error: ${e.message}`, { error: e });
  }
}

// function prepare(face) {
//   const [expression, expressionProbability] = Object.entries(
//     face.expressions
//   ).reduce((acc, val) => (val[1] > acc[1] ? val : acc), ["", 0]);
//   // const gender = face.gender;
//   // const genderProbabilityPercent = Math.round(100 * face.genderProbability);
//   const confidencePercent = Math.round(100 * face.detection._score);
//   const age = Math.round(10 * face.age) / 10;
//   const expressionProbabilityPercent = Math.round(100 * expressionProbability);
// }

async function createFaceMatcher(modelPath, distanceThreshold) {
  const key = `${modelPath}:${distanceThreshold}`;
  const cached = faceMatchers.get(key);
  if (cached !== undefined) return Ok(cached);

  try {
    const descriptorsJson = JSON.parse(await fs.promises.readFile(`./model/${modelPath}`, "utf-8"));
    const descriptors = descriptorsJson.map((x) => faceapi.LabeledFaceDescriptors.fromJSON(x));
    const faceMatcher = new faceapi.FaceMatcher(descriptors, distanceThreshold);
    faceMatchers.set(key, faceMatcher);
    return Ok(faceMatcher);
  } catch (error) {
    return Err(`createFaceMatcher error: ${error.message}`, { error });
  }
}

async function detectFaces(url) {
  if (!initialized) {
    const setupResult = await setup();
    if (setupResult.isErr) return setupResult;
    initialized = true;
  }

  const tensor = await image(url);
  const detectResult = await detect(tensor);
  // tensor.dispose();

  if (detectResult.isErr) {
    return detectResult;
  }

  return Ok(detectResult.value);
}

async function checkFaceMatch(url, modelName, distanceThreshold) {
  const facesResult = await detectFaces(url);
  if (facesResult.isErr) return facesResult;
  const faces = facesResult.value;

  const faceMatcherResult = await createFaceMatcher(modelName, distanceThreshold);
  if (faceMatcherResult.isErr) return faceMatcherResult;
  const faceMatcher = faceMatcherResult.value;

  return Ok(
    faces
      .filter((x) => x !== undefined)
      .map((face) => {
        const match = faceMatcher.findBestMatch(face.descriptor);
        return { label: match["_label"], distance: match["_distance"] };
      })
  );
}

module.exports.checkFaceMatch = checkFaceMatch;
