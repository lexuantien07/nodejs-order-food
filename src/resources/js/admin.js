import axios from 'axios';
import moment from 'moment';

export function initAdmin(socket) {
    const orderTableBody = document.querySelector('#orderTableBody')
    let orders = []
    let markup

    axios.get('/admin/order', {
        headers: {
            "X-Requested-With": "XMLHttpRequest"
        }
    }).then(res => {
        orders = res.data
        markup = generateMarkup(orders)
        orderTableBody.innerHTML = markup
    }).catch(err => {
        console.log(err)
    })

    function renderItems(items) {
        let parsedItems = Object.values(items)
        return parsedItems.map((item) => {
            return `
                <p>${ item.item.name } - ${ item.quantity } phần </p>
            `
        }).join('')
      }

    // function generateMarkup(orders) {
    //     return orders.map(order => {
    //         return `
    //             <tr>
    //             <td class="border px-4 py-2 text-green-900">
    //                 <p>${ order._id }</p>
    //                 <div>${ renderItems(order.items) }</div>
    //             </td>
    //             <td class="border px-4 py-2">${ order.customerId.name }</td>
    //             <td class="border px-4 py-2">${ order.address }</td>
    //             <td class="border px-4 py-2">
    //                 <div class="inline-block relative w-64">
    //                     <form action="/admin/order/status" method="POST">
    //                         <input type="hidden" name="orderId" value="${ order._id }">
    //                         <select name="status" onchange="this.form.submit()"
    //                             class="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline">
    //                             <option value="order_placed"
    //                                 ${ order.status === 'order_placed' ? 'selected' : '' }>
    //                                 Placed</option>
    //                             <option value="confirmed" ${ order.status === 'confirmed' ? 'selected' : '' }>
    //                                 Confirmed</option>
    //                             <option value="prepared" ${ order.status === 'prepared' ? 'selected' : '' }>
    //                                 Prepared</option>
    //                             <option value="delivered" ${ order.status === 'delivered' ? 'selected' : '' }>
    //                                 Delivered
    //                             </option>
    //                             <option value="completed" ${ order.status === 'completed' ? 'selected' : '' }>
    //                                 Completed
    //                             </option>
    //                         </select>
    //                     </form>
    //                 </div>
    //             </td>
    //             <td class="border px-4 py-2">
    //                 ${ moment(order.createdAt).format('hh:mm A') }
    //             </td>
    //             <td class="border px-4 py-2">
    //                 ${ order.paymentStatus ? 'Đã thanh toán' : 'Chưa thanh toán' }
    //             </td>
    //         </tr>
    //     `
    //     }).join('')
    // }

    function generateMarkup(orders) {
        return orders.map(order => {
            return `
                <tr>
                <td class="border px-4 py-2">
                    <p>${ order._id }</p>
                    <div>${ renderItems(order.items) }</div>
                </td>
                <td class="border px-4 py-2">${ order.customerId.name }</td>
                <td class="border px-4 py-2">${ order.address }</td>
                <td class="border px-4 py-2">
                    <div class="inline-block relative w-64">
                        <form action="/admin/order/status" method="POST">
                            <input type="hidden" name="orderId" value="${ order._id }">
                            <select name="status" onchange="this.form.submit()"
                                class="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline">
                                <option value="order_placed"
                                    ${ order.status === 'order_placed' ? 'selected' : '' }>
                                    Placed</option>
                                <option value="confirmed" ${ order.status === 'confirmed' ? 'selected' : '' }>
                                    Confirmed</option>
                                <option value="prepared" ${ order.status === 'prepared' ? 'selected' : '' }>
                                    Prepared</option>
                                <option value="delivered" ${ order.status === 'delivered' ? 'selected' : '' }>
                                    Delivered
                                </option>
                                <option value="completed" ${ order.status === 'completed' ? 'selected' : '' }>
                                    Completed
                                </option>
                            </select>
                        </form>
                    </div>
                </td>
                <td class="border px-4 py-2">
                    ${ moment(order.createdAt).format('hh:mm A') }
                </td>
                <td class="border px-4 py-2">
                    <span class="${ order.paymentStatus ? 'badge badge-primary rounded-pill d-inline' : 'badge badge-warning rounded-pill d-inline' }">${ order.paymentStatus ? 'Đã thanh toán' : 'Chưa thanh toán' }</span>
                    
                </td>
            </tr>
        `
        }).join('')
    }

    // Socket
    // let socket = io();

    socket.on('orderPlaced', (order) => {
        orders.unshift(order);
        orderTableBody.innerHTML = '';
        orderTableBody.innerHTML = generateMarkup(orders);
    });
}