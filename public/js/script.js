// Script for courses.ejs

document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('courseSearch');
    const courseCards = document.querySelectorAll('.course-card');
    const searchBtn = document.querySelector('.search-btn');

    function performSearch() {
        const searchTerm = searchInput.value.toLowerCase().trim();

        courseCards.forEach(card => {
            const title = card.querySelector('.course-title').textContent.toLowerCase();
            const id = card.querySelector('.course-id').textContent.toLowerCase();

            if (title.includes(searchTerm) || id.includes(searchTerm)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    searchInput.addEventListener('input', performSearch);
    searchBtn.addEventListener('click', performSearch);

    // Add keyboard support
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
});


//Script for help-center.ejs
function toggleAnswer(id) {
    var answer = document.getElementById(id);
    if (answer.style.display === "none") {
      answer.style.display = "block";
    } else {
      answer.style.display = "none";
    }
  }