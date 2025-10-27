function checkPass() {
    var password = document.getElementById('password').value;
    var confirmPassword = document.getElementById('confirm_password').value;
    var error = document.getElementById('error_message');
    if (confirmPassword != password) {
        error.innerHTML = "Passwords do not match.";
        return false;
    }
    else {
        error.innerHTML = "";
        return true;
    }
}