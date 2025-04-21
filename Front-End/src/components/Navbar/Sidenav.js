import React, { useContext } from "react";
import SideNav, {
  Toggle,
  Nav,
  NavItem,
  NavIcon,
  NavText,
} from "@trendmicro/react-sidenav";
import "@trendmicro/react-sidenav/dist/react-sidenav.css";
import { useHistory, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/Auth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCoffee,
  faHome,
  faThermometer,
  faUser,
  faUserTie,
  faFileInvoiceDollar,
  faUserTag,
  faReceipt,
  faChartPie,
  faCartPlus,
  faCarAlt,
  faBoxOpen,
  faPeopleCarry,
  faFileInvoice,
  faMoneyBill,
  faBullseye,
} from "@fortawesome/free-solid-svg-icons";
import displayToast from "../../utils/displayToast";
import { Button, Navbar, Container } from "react-bootstrap";

function Sidenav() {
  const history = useHistory();
  const location = useLocation();
  const { isLoggedIn, setUserData, userData } = useContext(AuthContext);

  const logoutUser = () => {
    displayToast("Logged out successfully!", "success");

    setTimeout(() => {
      setUserData(null);
      history.push("/");
    }, 1000);
  };

  if (!isLoggedIn) {
    return null;
  } else {
    return (


      <React.Fragment>
        <Navbar style={{ borderBottom: '2px solid #ddd' , textColor: 'white', backgroundColor: 'Silver'  }}>
          <Container>
            <Navbar.Brand href="/" style={{ paddingLeft: '40%', fontWeight: 'bold', textAlign: 'center', fontSize: '45px' , color: 'black' }}>
              APPLE PRODUCT APP
            </Navbar.Brand>



            <Navbar.Collapse className="justify-content-end">
              <Button className="light" onClick={logoutUser} style={{ backgroundColor: 'black', textColor: 'white' }}>
                Logout
              </Button>

            </Navbar.Collapse>
          </Container>
        </Navbar>

        <SideNav
          className="side--nav"
          onSelect={(selected) => {
            const to = "/" + selected;
            if (location.pathname !== to) {
              history.push(to);
            }

          }}
           expanded={true}
        >

          <SideNav.Nav defaultSelected="home">
            {}
            <NavItem eventKey="manage-products">

              <NavText style={{ fontSize: '18px', color: 'beige', fontWeight: 'bold' }}>Add Products</NavText>
            </NavItem>

            {userData.designation.toUpperCase() === "MANAGER" && (
              <NavItem eventKey="manage-employees">

                <NavText>Add Employees</NavText>
              </NavItem>
            )}

            <NavItem eventKey="manage-buyers">

              <NavText style={{ fontSize: '18px', color: 'beige', fontWeight: 'bold' }}>View Buyers</NavText>
            </NavItem>

            <NavItem eventKey="manage-purchase-order">


                {/* <i className="fa fa-fw fa-device" style={{ fontSize: '1.75em' }} /> */}

              <NavText style={{ fontSize: '18px', color: 'beige', fontWeight: 'bold' }}>Purchase Orders</NavText>
            </NavItem>

            <NavItem eventKey="manage-invoice">

              <NavText style={{ fontSize: '18px', color: 'beige', fontWeight: 'bold' }}>View Invoice</NavText>
            </NavItem>
          </SideNav.Nav>
        </SideNav>
      </React.Fragment>
    );
  }
}

export default Sidenav;
