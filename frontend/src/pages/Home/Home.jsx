import styles from "./Home.module.css";

const Home = () => {
  return (
    <div className={styles.homeContainer}>
      <div className={styles.notiContainer}>
        <h2>Notificaciones</h2>
        <NotificationTable />
      </div>
      <div className={styles.pendContainer}>
        <h2>Bandeja de pendientes</h2>
        <PendingOrders />
        <button
          className={`button lightblue ${styles.center}`}
          onClick={() => navigate("/order-tracker/pedidos")}
        >
          Generar pedido
          <HiOutlineDocumentAdd />
        </button>
        <CashRegister
          isOpen={isCashRegisterBeingOpened || isCashRegisterBeingClosed}
          onClose={handleCashRegisterCancelled}
          onCashRegisterOpened={handleCashRegisterOpened}
          onCashRegisterClosed={handleCashRegisterClosed}
          isClosing={isCashRegisterBeingClosed}
        />
      </div>
      <div className={styles.asideContainer}>
        <h2>
          Caja <FaCashRegister className={styles.cashRegisterIcon} />
        </h2>

        <table
          className={styles.cashTable}
          onClick={() => setCashRegisterHidden(!cashRegisterHidden)}
        >
          {cashRegister && Object.keys(cashRegister).length > 0 ? (
            <tbody>
              {cashRegisterHidden ? (
                <tr>
                  <th className={styles.hiddenIcon}>
                    <FaEyeSlash />
                  </th>
                </tr>
              ) : (
                <>
                  <tr>
                    <th>Encargado</th>
                    <td>{username}</td>
                  </tr>
                  <tr>
                    <th>Monto Inicial</th>
                    <td>${cashRegister.initialAmount}</td>
                  </tr>
                  <tr>
                    <th>Total Compras</th>
                    <td>${cashRegister.totalPurchases}</td>
                  </tr>
                  <tr>
                    <th>Total Ventas</th>
                    <td>${cashRegister.totalSales}</td>
                  </tr>
                  <tr>
                    <th>Monto Final</th>
                    <td>${finalAmount}</td>
                  </tr>
                  <tr>
                    <th>Diferencia</th>
                    <td
                      className={
                        finalAmount < cashRegister.initialAmount
                          ? styles.red
                          : styles.green
                      }
                    >
                      ${difference}
                    </td>
                  </tr>
                </>
              )}
            </tbody>
          ) : (
            <tbody>
              <tr>
                <th className={styles.closedText}>Cerrada</th>
              </tr>
            </tbody>
          )}
        </table>
        <div className={styles.buttonContainer}>
          {isCashRegisterOpen && <p>{calculateElapsedTime()}</p>}
          <button
            className={`button ${
              isCashRegisterOpen ? styles.closeButton : styles.openButton
            }`}
            onClick={
              isCashRegisterOpen
                ? handleCloseCashRegister
                : handleOpenCashRegister
            }
          >
            {isCashRegisterOpen ? "Cerrar Caja" : "Abrir Caja"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
