// var emojiResults = sessionStorage.getItem('emojiResults');
// const numWrong = sessionStorage.getItem("numWrong");
// const correctSpellingLst = sessionStorage.getItem("correctSpellingLst").split(',');
// const submissionLst = sessionStorage.getItem("submissionLst").split(',');
// const puzzleNum = sessionStorage.getItem("puzzleNum");
const results = document.querySelector("#results");
const copyBtn = document.querySelector("#copy-btn")
const typos = document.querySelector("#typos")

// copyBtn.addEventListener("click", async (e) => {
//     e.preventDefault();
//     shareableResults = `Spellcheck #${puzzleNum}\n${sessionStorage.getItem('emojiResults').replaceAll("\\n", "\n").replaceAll(" ", "")}`;
//     await navigator.clipboard.writeText(shareableResults);
// })

// if (emojiResults != null) {
//     localStorage.setItem("dailyStatus", true)
// }

const resultsJson = JSON.parse(sessionStorage.getItem('results'));
console.log(sessionStorage.getItem('results'));
let totalCount = 0;
let totalCorrect = 0;

const resultHeading = buildGridContainer('1fr 1fr 1fr');
resultHeading.append(buildCell('Difficulty',1),buildCell('Score',2),buildCell('%',3));
resultHeading.style.borderBottom = '1px solid black';
results.appendChild(resultHeading);

Object.keys(resultsJson).forEach((round) => {


    let roundTotal = resultsJson[round].length;
    let roundCorrect = 0;

    const detail = buildGridContainer('1fr 1fr 50px', true);
    detail.appendChild(buildHeader(round));

    resultsJson[round].forEach((result) => {

        const word = buildCell(`<h4 style="margin: 0px;">${result.word}</h4>`, 1);
        const submission = buildCell(`<p class="${(result.isCorrect) ? '' : 'error'}" style="margin: 0px;">${result.submission}</p>`, 2);
        const icon = buildCell((result.isCorrect) ? `<span class="fa fa-check"></span>` : `<span class="fa fa-xmark"></span>`, 3);

        // Totals Count
        totalCount++;

        if (result.isCorrect) {
            totalCorrect++;
            roundCorrect++;
            return;
        }

        detail.append(word, submission, icon);

    })

    const overview = buildGridContainer('1fr 1fr 1fr');
    const roundLablel = buildCell(`<p style="margin: 0px;">${round.split(':')[1]}</p>`, 1);
    const roundFration = buildCell(`<p style="margin: 0px;">${roundCorrect}/${roundTotal}</p>`, 2);
    const roundPercent = buildCell(`<p style="margin: 0px;">${Math.round((roundCorrect / roundTotal) * 100)}%</p>`, 3);

    overview.append(roundLablel, roundFration, roundPercent);
    results.appendChild(overview)
    typos.appendChild(detail)
});

const totals = buildGridContainer('1fr 1fr 1fr');
totals.style.borderTop = '1px solid black';

const totalsLablel = buildCell(`<p style="margin: 0px; font-weight: 700;">Total</p>`, 1);
const totalsFration = buildCell(`<p style="margin: 0px;">${totalCorrect}/${totalCount}</p>`, 2);
const totalsPercent = buildCell(`<p style="margin: 0px;">${Math.round((totalCorrect / totalCount) * 100)}%</p>`, 3);

totals.append(totalsLablel, totalsFration, totalsPercent);
results.appendChild(totals);


function buildGridContainer(colSpacing, withHeader) {
    const grid = document.createElement('div');
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = colSpacing;
    grid.style.gridAutoRows = '30px';
    grid.style.marginBottom = '1rem';
    // grid.style.padding = '0px 10px';
    if (withHeader) grid.style.gridTemplateRows = '1.5fr';
    return grid;
}

function buildHeader(key) {
    const node = document.createElement('div');
    node.innerHTML = `<h3 style="margin: 0px;">${key.toUpperCase()} WORDS</h3>`;
    node.style.gridColumn = '1 / span 3';
    node.style.borderBottom = '1px solid black';
    // node.style.margin = '0px 10px';
    // node.style.padding = '10px 0px';
    return applyFlexStyles(node);
}

function buildCell(innerHTML, col) {
    const node = document.createElement('div');
    node.innerHTML = innerHTML;
    node.style.gridColumn = col;
    return applyFlexStyles(node);
}

function applyFlexStyles(node) {
    node.style.display = 'flex';
    node.style.justifyContent = 'space-around';
    node.style.alignItems = 'center';
    return node;
}


// numRows = correctSpellingLst.length;
// test = ''
// for (var i = 0; i < numRows; i++) {
//     if (i == 0) {
//         test += `
//         <tr>
//             <td colspan=3 style="text-align: center"><b>EASY WORDS</b></td>
//         </tr>
//         `
//     }
//     if (i == 5) {
//         test += `
//         <tr>
//             <td colspan=3 style="text-align: center"><b>MEDIUM WORDS</b></td>
//         </tr>
//         `
//     }
//     if (i == 10) {
//         test += `
//         <tr>
//             <td colspan=3 style="text-align: center"><b>HARD WORDS</b></td>
//         </tr>
//         `
//     }
//     test += `
//     <tr>
//         <td>${i + 1}</td>
//         ${correctSpellingLst[i]}
//         ${submissionLst[i]}
//     </tr>
//     `
// }
// typos.innerHTML = test;
// emojiResults = emojiResults.replaceAll('\\n', '<br>')
// results.innerHTML = `${emojiResults}`;
