$(document).ready(function () {
  let QUESTIONCOUNT = 2;
  let QUESTIONTIME = 5; //seconds
  if (location.pathname.replace("/quiz/", "").includes("view")) {
    let quizID = location.pathname.replace("/quiz/view/", "");
    console.log("quizID: " + quizID);
    $.get("/quiz/get/quiz/" + quizID, async function (result) {
      let quizQuestionsID = result.filter((quiz) => quiz.quizID == quizID);
      let questions = [];
      console.log(quizQuestionsID);
      let index = 0;
      for (let quizQuestion of quizQuestionsID) {
        await $.get(
          "/questions/getv2/" + quizQuestion.questionID,
          function (question) {
            question.userAnswer = quizQuestion.answerIndex;
            questions.push(question);
            addToHTMLList(question, index, false);
            index++;
          }
        );
      }
      console.log(questions);
      console.log(quizQuestionsID);
    });
  } else if (location.pathname.replace("/quiz/", "").includes("section")) {
    let quizSectionID = location.pathname.replace("/quiz/section/", "");
    $.get("/questions/get", (result) => {
      result = result.filter(
        (question) => question.sectionID[0] == quizSectionID
      );
      let questions = selectRandomItems(
        result,
        result.length < QUESTIONCOUNT ? result.length : QUESTIONCOUNT
      );
      console.log(result);
      console.log(questions);

      questions.forEach((question, index) => addToHTMLList(question, index));
      $("#timer")
        .data("seconds-left", QUESTIONTIME * questions.length)
        .startTimer({
          onComplete: function () {
            submit();
            alert("Süreniz doldu. Cevaplarınız gönderiliyor.");
          },
        });
      // end of the question foreach
      sessionStorage.setItem("questions", JSON.stringify(questions));
      sessionStorage.setItem("quiz", JSON.stringify({ quizTypeID: 1 }));

      $(".btn-group-vertical").on("click", ".btn", function () {
        $(this).addClass("active").siblings().removeClass("active");
      });
    });
  }
});
function addToHTMLList(question, index, isAnswerRandom = true) {
  let stylishHTMLElement = "";
  let answers = isAnswerRandom
    ? selectRandomItems(question.answers, question.answers.length)
    : question.answers;
  answers.forEach((answer, i) => {
    stylishHTMLElement += `<button ${
      question?.userAnswer != undefined ? "disabled" : ""
    } type="button" class="btn ${
      question?.userAnswer !== undefined
        ? (question.rightAnswerIndex == answer.answerIndex
            ? "rightAnswer "
            : "") +
          (question?.userAnswer == answer.answerIndex
            ? "active " +
              (question?.userAnswer != question.rightAnswerIndex
                ? "false "
                : "")
            : "")
        : ""
    } " value="${answer.answerIndex}">${String.fromCharCode(65 + i)}) ${
      answer.answerText
    }</button>`;
  });

  $("#quizContainer").append(`<div class="container question-item">
        <span class="question-number">${index + 1}</span>
        <div class="question-head">
          <div class="question-img">
          ${question.image != null ? "<img src='" + question.image + "'>" : ""}
          </div>
          <div class="question-text-area">
            <div class="question-subject">
              <span>${question.sectionName} </span>|<span> ${
    question.unitName
  }</span>
            </div>
            <div class="question-text">
            ${question.questionText}
            </div>
          </div>
        </div>
        <div class="question-stylish ${
          question?.userAnswer == null ? "null" : ""
        } btn-group-vertical">
          
            ${stylishHTMLElement}
         
        </div>
      </div>`);
}
function selectRandomItems(array, count) {
  let randomArray = [];
  let alreadyIndexes = [];
  let randomIndex;
  for (let i = 0; i < count; i++) {
    randomIndex = Math.floor(Math.random() * array.length);
    while (alreadyIndexes.includes(randomIndex))
      randomIndex = Math.floor(Math.random() * array.length);
    alreadyIndexes.push(randomIndex);
    randomArray.push(array[randomIndex]);
  }
  return randomArray;
}
function submit() {
  $("#timer").remove();
  let questions = JSON.parse(sessionStorage.getItem("questions"));
  let answers = [];
  let correctCounter = 0,
    uncorrectCounter = 0,
    nullCounter = 0;
  $("#quizContainer")
    .children()
    .children(".question-stylish")
    .each((index, question) => {
      let activeButton = Array.from(question.children).filter((chapter) =>
        chapter.classList.contains("active")
      )[0];
      if (activeButton == undefined) nullCounter++;
      else if (activeButton.value == questions[index].rightAnswerIndex)
        correctCounter++;
      else uncorrectCounter++;

      answers.push({
        questionID: questions[index].questionID,
        answerIndex:
          activeButton != undefined ? parseInt(activeButton.value) : null,
      });
    });
  let date = new Date();
  console.log(date);
  let quiz = {
    quizTypeID: JSON.parse(sessionStorage.getItem("quiz")).quizTypeID,
    userID: JSON.parse(localStorage.getItem("user")).userID,
    correctCount: correctCounter,
    uncorrectCount: uncorrectCounter,
    nullCount: nullCounter,
    date: `${date.getFullYear()}-${
      date.getMonth() + 1
    }-${date.getDate()} ${date.getHours()}:${date.getMinutes()}`,
    answers: JSON.stringify(answers),
  };
  $.post("/quiz/insert", quiz, function (result) {
    location.replace("/quiz/view/" + result.quizID); //Sınavdan sonra sonuçların hemen gözükmesi için
  });
}
