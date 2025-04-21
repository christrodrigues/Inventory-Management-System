import axios from "axios";
import React, { useEffect, useState } from "react";
import { Container, Row, Button, Col, Table, Modal } from "react-bootstrap";
import { Link } from "react-router-dom";
import { URLS } from "../../routes";
import displayToast from "../../utils/displayToast";

function ManageInvoice() {
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    let isActive = true;

    if (isActive) {
      fetchInvoices();
    }
    return () => {
      isActive = false;
    };
  }, []);

  const fetchInvoices = async () => {
    const url = URLS.GET_ALL_INVOICE;
    axios
      .get(url)
      .then(function (response) {
        console.log(response);
        setInvoices(response.data);
      })
      .catch(function (error) {
        console.log(error);
        displayToast({ type: "error", msg: "Oops! Something went wrong" });
      });
  };

  return (
    <Container className="container-main">
      <Row className="container-main">
        <Col>
          <h3>Buyers Invoices</h3>
        </Col>
      </Row>
      <Row>
        <Table className="table table-success">
          <div id="customers">
            <thead>
              <tr>
                <th>Sr. No.</th>
                <th>Company Name</th>
                <th>Total Products</th>
                <th>Total Quantity</th>
                <th>Total Price</th>
                <th>Payment Date</th>
              </tr>
            </thead>

            <tbody>
              {invoices.map((item, index) => {
                const { id, purchaseOrder, paymentDate } = item;
                const { products, buyer = {}, totalAmount } = purchaseOrder;
                let { companyName = "" } = buyer;
                let qty = products.reduce(
                  (acc, current) => acc + current.quantity,
                  0
                );

                return (
                  <tr key={id}>
                    <td>{index + 1}</td>
                    <td>{companyName}</td>
                    <td>{products.length}</td>
                    <td>{qty}</td>
                    <td>{totalAmount}</td>
                    <td>{paymentDate}</td>
                  </tr>
                );
              })}
            </tbody>
          </div>
        </Table>
      </Row>
    </Container>
  );
}

export default ManageInvoice;
