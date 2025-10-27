document.addEventListener('DOMContentLoaded', function() {
    // Initialize select elements
    var selects = document.querySelectorAll('select');
    M.FormSelect.init(selects);

    // Auto-submit form when select values change
    var sortBySelect = document.getElementById('sortBy');
    var orderSelect = document.getElementById('order');

    if (sortBySelect && orderSelect) {
        sortBySelect.addEventListener('change', function() {
            this.form.submit();
        });
        
        orderSelect.addEventListener('change', function() {
            this.form.submit();
        });
    }
});