$(document).ready(function () {
  // ================================================ Bear Image ================================================ //
  // Bear image states (Converted from React REPO: https://github.com/wiscaksono/tunnel-bear-login-page)
  const watchBearImgs = Array.from(
    { length: 21 },
    (_, i) => `assets/img/watch_bear_${i}.png`
  );
  const hideBearImgs = Array.from(
    { length: 6 },
    (_, i) => `assets/img/hide_bear_${i}.png`
  );
  let currentFocus = "USERNAME";
  const bearImage = $("#bear-image img");

  function updateBearImage() {
    if (currentFocus === "USERNAME") {
      const usernameLength = $('input[name="username-login"]').val().length;
      const index = Math.min(
        Math.floor((usernameLength / 21) * watchBearImgs.length),
        watchBearImgs.length - 1
      );
      bearImage.attr("src", watchBearImgs[index]);
    } else if (currentFocus === "PASSWORD") {
      let index = 0;
      const animateCloseBear = () => {
        bearImage.attr("src", hideBearImgs[index]);
        index++;
        if (index < hideBearImgs.length) {
          setTimeout(animateCloseBear, 100);
        }
      };
      animateCloseBear();
    }
  }

  // Event listeners
  $('input[name="username-login"]').on("focus", function () {
    currentFocus = "USERNAME";
    updateBearImage();
  });

  $('input[name="password-login"]').on("focus", function () {
    currentFocus = "PASSWORD";
    updateBearImage();
  });

  $('input[name="username-login"]').on("blur", function () {
    bearImage.attr("src", watchBearImgs[0]);
  });

  $('input[name="password-login"]').on("blur", function () {
    let index = hideBearImgs.length - 1;
    const animatePeekBear = () => {
      bearImage.attr("src", hideBearImgs[index]);
      index--;
      if (index >= 0) {
        setTimeout(animatePeekBear, 100);
      } else {
        bearImage.attr("src", watchBearImgs[0]);
      }
    };
    animatePeekBear();
  });

  $('input[name="username-login"]').on("input", updateBearImage);

  // ================================================ Login Form ================================================ //
  $("#login-form").submit(function (e) {
    e.preventDefault();

    const username = $('input[name="username-login"]').val();
    const password = $('input[name="password-login"]').val();

    $.ajax({
      url: "http://localhost:3000/login",
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify({ username, password }),
      // xhrFields: {
      //   withCredentials: true, // I use this when I set the cookie in the server
      // },
      success: function (response) {
        if (response.success) {
          const cookieValue = JSON.stringify({
            user_id: response.user.user_id,
            username: response.user.username,
            email: response.user.email,
          });

          document.cookie = `auth=${cookieValue}; path=/; domain=localhost`;

          // localStorage.setItem("user", JSON.stringify(response.user)); // This is when I use localStorage
          window.location.href = "index.html";
        } else {
          alert(response.message || "Login failed");
        }
      },
      error: function (xhr) {
        console.error("Login error:", xhr);
        const error = xhr.responseJSON
          ? xhr.responseJSON.message
          : "Server error";
        alert(error);
      },
    });
  });

  // ================================================ Register Form ================================================ //

  // Register Modal Hide/Show
  $("#register-button").click(function () {
    $("#register-modal").removeClass("hidden");
  });

  $("#cancel-register").click(function () {
    $("#register-modal").addClass("hidden");
  });

  // Register Form Validation
  $('input[name="username-register"]').on("input", function () {
    const username = $(this).val();
    const errorDiv = $("#username-error");

    if (username.length < 3) {
      errorDiv
        .text("Username must be at least 3 characters")
        .css("color", "red");
    } else if (username.length > 20) {
      errorDiv
        .text("Username must be less than 20 characters")
        .css("color", "red");
    } else {
      errorDiv.text("");
    }
  });

  $('input[name="email-register"]').on("input", function () {
    const email = $(this).val();
    const errorDiv = $("#email-error");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      errorDiv.text("Please enter a valid email address").css("color", "red");
    } else {
      errorDiv.text("");
    }
  });

  $('input[name="password-register"]').on("input", function () {
    const password = $(this).val();
    const errorDiv = $("#password-error");

    if (password.length < 6) {
      errorDiv
        .text("Password must be at least 6 characters")
        .css("color", "red");
    } else if (password.length > 30) {
      errorDiv
        .text("Password must be less than 30 characters")
        .css("color", "red");
    } else {
      errorDiv.text("");
    }
  });

  $("#register-form").submit(function (e) {
    e.preventDefault();

    const username = $('input[name="username-register"]').val();
    const password = $('input[name="password-register"]').val();
    const email = $('input[name="email-register"]').val();

    if (username.length < 3 || username.length > 20) {
      e.preventDefault;
      return;
    }

    if (password.length < 6 || password.length > 30) {
      e.preventDefault();
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      e.preventDefault();
      return;
    }

    // Ajax Request
    $.ajax({
      url: "http://localhost:3000/register",
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify({ username, password, email }),
      success: function () {
        alert("User registered successfully");
        $("#register-modal").addClass("hidden");
        $("#register-form")[0].reset();
      },
      error: function (xhr) {
        let errorMessage = "Registration failed";

        try {
          if (xhr.responseJSON && xhr.responseJSON.message) {
            errorMessage = xhr.responseJSON.message;
          } else if (xhr.responseText) {
            const response = JSON.parse(xhr.responseText);
            errorMessage = response.message || errorMessage;
          } else {
            errorMessage = xhr.statusText || errorMessage;
          }
        } catch (e) {
          console.error("Error parsing response:", e);
        }

        switch (errorMessage) {
          case "Username already exists":
            alert("Username is already taken");
            break;
          case "Email already exists":
            alert("Email is already registered");
            break;
          case "Invalid email address":
            alert("Invalid email address");
            break;
          default:
            alert(errorMessage);
        }
      },
    });
  });
});
