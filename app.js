const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const tx = [];

app.get('/tx', (req, res) => {
    res.send(tx);
});

app.post('/tx', (req, res) => {
    const operation = req.body;
    tx.push(operation);
    res.send(tx);
});

app.get('/balance', (req, res) => {
    let balance = 0;
    for (let i = 0; i < tx.length; i++) {
        balance += tx[i].value;
    }
    res.send({
        balance
    });
});

app.get('/compiled', (req, res) => {
    const result = [];
    let tag = '';

    const txCopy = tx.slice();
    const sorted = txCopy.sort(sortTxByTag);

    // agrupar gastos por tag
    let tags = [];
    for (let i =0; i < sorted.length; i++) tags.push(sorted[i].tag);
    tags = tags.filter((elem, i, self) => i === self.indexOf(elem));
    
    for (let i = 0; i < tags.length; i++) {
        const tag = tags[i];
        let value = 0.00;
        for (let j = 0; j < txCopy.length; j ++) {
            if (txCopy[j].tag === tag) {
                value += txCopy[j].value;
            }
        }
        result.push(Object.assign({}, { tag: tag, value: value }));
    }

    // retirar positivos
    const gastos = [];
    for (let i = 0; i < result.length; i++) {
        if (result[i].value < 0) gastos.push(result[i]);
    }
    
    // ordenar
    gastos.sort((a, b) => {
        if (parseFloat(a.value) < parseFloat(b.value)) return -1;
        if (parseFloat(a.value) > parseFloat(b.value)) return 1;
        return 0;
    });

    res.send(gastos);
});

function sortTxByTag(a, b) {
    if (a.tag < b.tag) return -1;
    if (a.tag > b.tag) return 1;
    return 0;
}

app.listen(8080, () => {
    console.log('App listening on port 8080');
});