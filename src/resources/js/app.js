import axios from 'axios';
import moment from 'moment';
import { initAdmin } from './admin';

let addToCart = document.querySelectorAll('.add-to-cart');
// let addToCart2 = document.querySelectorAll('.add-to-cart2');
let cartCounter = document.querySelector('#cartCounter');

function updateCart(item) {
    axios.post('/update-cart', item).then(res => {
        cartCounter.innerText = res.data.totalQuantity;
    })
}

addToCart.forEach((btn) => {
    btn.addEventListener('click', (e) => {
        let item = JSON.parse(btn.dataset.item);
        updateCart(item);
    })
})

// addToCart2.forEach((btn) => {
//     btn.addEventListener('click', (e) => {
//         let item = JSON.parse(btn.dataset.item);
//         updateCart(item);
//     })
// })


//order's status
let hiddenInput = document.querySelector('#hiddenInput');
let order = hiddenInput ? hiddenInput.value : null;
order = JSON.parse(order);
let status = document.querySelectorAll('.status_line');
let small = document.createElement('small');

function updateStatus (order) {
    status.forEach((stt) => {
        stt.classList.remove('step-completed');
        stt.classList.remove('current');
    });
    let completed = true;
    status.forEach((stt) => {
        let dataStatus = stt.dataset.status;
        if (completed) {
            stt.classList.add('step-completed');
        }
        if (dataStatus === order.status) {
            completed = false;
            small.innerText = moment(order.updatedAd).format('hh:mm A');
            stt.appendChild(small);
            if(stt.nextElementSibling) {
                stt.nextElementSibling.classList.add('current');
            }
        }
    })
}

updateStatus(order);

const payType = document.querySelector('#paytype');
if(payType) {
    payType.addEventListener('change' , (e)=> {
        console.log('value', e.target.value);
        if(e.target.value === 'paypal') {
            document.querySelector('#payTypeInput').value = 'paypal';
        } else {
            document.querySelector('#payTypeInput').value = 'cod';
        }
        
    })
}

//socket.io

let socket = io();

if (order) {
    socket.emit('join', `order_${order._id}`);
}

let adminPath = window.location.pathname;
console.log('data path', window.location.pathname);
if (adminPath.includes('admin')) {
    initAdmin(socket);
    socket.emit('join', 'admin');
}


socket.on('orderUpdated', (data) => {
    const updatedOrder = { ...order };
    updatedOrder.updatedAd = moment().format();
    updatedOrder.status = data.status;
    updateStatus(updatedOrder);
});