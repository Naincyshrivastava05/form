document.addEventListener("DOMContentLoaded", () => {
    let token = null; // Store the token globally

    // Function to fetch the customer list and populate the table
    const fetchCustomerList = () => {
      fetch("https://qa2.sunbasedata.com/sunbase/portal/api/assignment_auth.jsp", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })
      .then(response => response.json())
      .then(data => {
        const table = document.getElementById("customerTable");
        table.innerHTML = `
          <tr>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Action</th>
          </tr>
        `;

        data.forEach(customer => {
          const row = table.insertRow(-1);
          row.insertCell().innerText = customer.first_name;
          row.insertCell().innerText = customer.last_name;
          row.insertCell().innerText = customer.email;
          row.insertCell().innerText = customer.phone;
          const deleteBtn = document.createElement("button");
          deleteBtn.innerText = "Delete";
          deleteBtn.addEventListener("click", () => deleteCustomer(customer.uuid));
          row.insertCell().appendChild(deleteBtn);
        });
      })
      .catch(error => {
        console.error("Error:", error);
        alert("Failed to fetch the customer list.");
      });
    };

    // Function to delete a customer
    const deleteCustomer = (uuid) => {
      if (confirm("Are you sure you want to delete this customer?")) {
        fetch("https://qa2.sunbasedata.com/sunbase/portal/api/assignment.jsp", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            cmd: "delete",
            uuid: uuid
          })
        })
        .then(response => response.json())
        .then(data => {
          if (data.status === 200) {
            alert("Customer deleted successfully.");
            // Refresh the customer list after deletion
            fetchCustomerList();
          } else if (data.status === 400) {
            alert("Customer not found.");
          } else {
            alert("Error deleting customer.");
          }
        })
        .catch(error => {
          console.error("Error:", error);
          alert("Error deleting customer.");
        });
      }
    };

    // Function to handle login form submission
    document.getElementById("loginForm").addEventListener("submit", function(event) {
      event.preventDefault();
      const login_id = document.getElementById("login_id").value;
      const password = document.getElementById("password").value;

      // Make a POST request to the authentication API
      fetch("https://qa2.sunbasedata.com/sunbase/portal/api/assignment_auth.jsp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          login_id: login_id,
          password: password
        })
      })
      .then(response => {
        if (!response.ok) {
          throw new Error("Authentication failed");
        }
        return response.json();
      })
      .then(data => {
        // Store the received token globally
        token = data.token;

        // Hide the login form and show the customer list
        document.getElementById("loginForm").style.display = "none";
        document.getElementById("customerTable").style.display = "block";

        // Fetch and populate the customer list
        fetchCustomerList();
      })
      .catch(error => {
        alert("Authentication failed. Please check your credentials.");
        console.error("Error:", error);
      });
    });

    // Function to handle customer form submission (create/update)
    document.getElementById("customerForm").addEventListener("submit", function(event) {
      event.preventDefault();
      const first_name = document.getElementById("first_name").value;
      const last_name = document.getElementById("last_name").value;
      const email = document.getElementById("email").value;
      const phone = document.getElementById("phone").value;

      // Determine if it's an update or create request based on the presence of uuid
      const urlParams = new URLSearchParams(window.location.search);
      const uuid = urlParams.get("uuid");
      const requestBody = uuid ? { cmd: "update", uuid: uuid } : { cmd: "create" };

      requestBody.first_name = first_name;
      requestBody.last_name = last_name;
      requestBody.email = email;
      requestBody.phone = phone;

      fetch("https://qa2.sunbasedata.com/sunbase/portal/api/assignment.jsp", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
      })
      .then(response => response.json())
      .then(data => {
        if (data.status === 200) {
          alert(uuid ? "Customer updated successfully." : "Customer created successfully.");
          // Clear the form after successful submission
          document.getElementById("customerForm").reset();
          // Fetch and update the customer list
          fetchCustomerList();
        } else if (data.status === 400) {
          alert("First Name or Last Name is missing.");
        } else {
          alert(uuid ? "Error updating customer." : "Error creating customer.");
        }
      })
      .catch(error => {
        console.error("Error:", error);
        alert(uuid ? "Error updating customer." : "Error creating customer.");
      });
    });
  });