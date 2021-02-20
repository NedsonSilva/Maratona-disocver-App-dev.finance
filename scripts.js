const Modal = {
  openClose() {
    document.querySelector('.modal').classList.toggle('active');
  }
}

document.getElementById('new').onclick = Modal.openClose;

document.getElementById('cancel').onclick = Modal.openClose;

const Storage = {
  get() {
    return JSON.parse(localStorage.getItem('AllTransactions')) || [];
  },
  set(transaction) {
    localStorage.setItem('AllTransactions', JSON.stringify(transaction));
  }
}

//  |||| Soma de todas as transações
const Transaction = {
  all: Storage.get(),

  add(transaction) {
    Transaction.all.push(transaction);

    App.reload();
  },

  remove(index) {
    Transaction.all.splice(index, 1);

    App.reload();
  },

  entradas() {
    let entradas = 0;
    //Pegar todas as transações
    Transaction.all.forEach(transaction => {
      if( transaction.value > 0 ) {
        entradas = entradas + transaction.value;
        }
    });

    return entradas;
  },

  saidas() {
    let saidas = 0;
    //Pegar todas as transações
    Transaction.all.forEach(transaction => {
      if( transaction.value < 0 ) {
        saidas = saidas + transaction.value;
        }
    });

     return saidas;
  },

  total() {
    return Transaction.entradas() + Transaction.saidas();
  }
}

//  ||| Inserir, mostrar as transações ||||
const balance = {
  transactionsContainer: document.querySelector('#data_table tbody'),

  //  ||| Adiciona as transações ao html
  addTransaction(transaction, index) {
    const tr = document.createElement('tr');

    tr.innerHTML = balance.innerHTMLTransaction(transaction, index);
    tr.dataset.index = index ;

    balance.transactionsContainer.appendChild(tr);
  },
  //  |||| Mostrar transações feitas  ||||
  innerHTMLTransaction(transaction, index) {

    const CSSclass = transaction.value > 0 ? 'entradas' : 'saidas';

    const value = Utils.formatCurrency(transaction.value);

    const html = `
    <td class="description">${transaction.description}</td>
    <td class="${CSSclass}">${value}</td>
    <td class="date">${transaction.date}</td>
    <td>
      <img onclick="Transaction.remove(${index})"  id="remove" src="assets/minus.svg" alt="remover">
    </td>
    `
    return html;
  },

  updateBalance() {
    const entradas = document.getElementById('entradasDisplay');
    const saidas = document.getElementById('saidasDisplay');
    const total = document.getElementById('totalDisplay');

    entradas.innerHTML = Utils.formatCurrency(Transaction.entradas());
    saidas.innerHTML = Utils.formatCurrency(Transaction.saidas());
    total.innerHTML = Utils.formatCurrency(Transaction.total())

  },

  clearTransactions() {
    balance.transactionsContainer.innerHTML = '';
  }
}


const Utils = {
  formatCurrency(value) {
    const signal = Number(value) < 0 ? '-' : '';
    //Acha tudo q nao é numero e remova
    value = String(value).replace(/\D/g, '');

    value = Number(value) / 100;

    value = value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });

    return signal + value;
  },

  formatDate(date) {
    //Remove as separaçoes da data
    const splitDate = date.split('-');

    return `${splitDate[2]}/${splitDate[1]}/${splitDate[0]}`;
  },

  formatValue(value) {
    value = Number(value) * 100;

    return value;
  }
}

const Form = {
  description: document.getElementById('description'),
  value: document.getElementById('value'),
  date: document.getElementById('date'),

  getValues() {
    return {
      description: Form.description.value,
      value: Form.value.value,
      date: Form.date.value
    }
  },

  validateFields() {

    const {description, value, date} = Form.getValues();

    if(description.trim() === '' || value.trim() === '' || date.trim() === '') {
      throw new Error('error');
    }
  },

  formatData() {
    let {description, value, date} = Form.getValues();

    value = Utils.formatValue(value);

    date = Utils.formatDate(date);

    return {description, value, date};
  },

  messageError() {
    const activeError = document.querySelector('.error');

    activeError.classList.add('activeError');

    setTimeout(() => {
      activeError.classList.remove('activeError');
    }, 2000);
  },

  clearFields() {
    Form.description.value = '';
    Form.value.value = '';
    Form.date.value = '';
  },

  submit(event){
    event.preventDefault();

    try {
      //Verificar se os campos sao validos
      Form.validateFields();

      //Formata os dados
      const transactionFormated = Form.formatData();

      //Salve all transactions formated
      Transaction.add(transactionFormated);

      //Limpa os campos depois de salvos
      Form.clearFields();

      //Fecha o modal depois de clicar em salvar
      Modal.openClose();

    } catch (error) {
      Form.messageError();
    }
  }
}

const App = {
  init() {
    //Percorre as posiçoes do array transaction
    Transaction.all.forEach((transaction, index) => {
      balance.addTransaction(transaction, index)
    });

    balance.updateBalance();

    Storage.set(Transaction.all);
  },
  reload() {
    balance.clearTransactions();
    App.init();
  }
}

App.init();

