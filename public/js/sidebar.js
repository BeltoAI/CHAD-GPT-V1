document.addEventListener('DOMContentLoaded', function () {
    const openSidebarButton = document.getElementById('open-sidebar');
    const closeSidebarButton = document.getElementById('close-sidebar');
    const sidebar = document.getElementById('sidebar');
    const promptBar = document.querySelector('.prompt-bar'); // Target the prompt bar
    const beltoDoc = document.querySelector('.belto-doc'); // Target the BELTO text
    const container = document.querySelector('.container'); // Target the main container

    // Open sidebar
    openSidebarButton.addEventListener('click', () => {
        sidebar.classList.add('open');
        openSidebarButton.classList.add('hidden'); // Hide the open button
        promptBar.classList.add('squeezed'); // Add the "squeezed" class to animate prompt bar
        beltoDoc.classList.add('squeezed'); // Add the "squeezed" class to BELTO text
        container.classList.add('squeezed-container'); // Add to container for nice layout shift
    });

    // Close sidebar
    closeSidebarButton.addEventListener('click', () => {
        sidebar.classList.remove('open');
        openSidebarButton.classList.remove('hidden'); // Show the open button
        promptBar.classList.remove('squeezed'); // Remove the "squeezed" class to restore prompt bar
        beltoDoc.classList.remove('squeezed'); // Remove the "squeezed" class from BELTO text
        container.classList.remove('squeezed-container'); // Restore container size
    });

    // Allow dragging of the sidebar toggle (if needed)
    let isDragging = false;
    let startY;
    let startTop;

    function startDragging(e) {
        isDragging = true;
        startY = e.clientY || e.touches[0].clientY;
        startTop = openSidebarButton.offsetTop;
        document.body.classList.add('no-select'); // Prevent text selection while dragging
    }

    function dragMove(e) {
        if (isDragging) {
            const currentY = e.clientY || e.touches[0].clientY;
            const newY = startTop + (currentY - startY);

            // Get viewport height
            const viewportHeight = window.innerHeight;

            // Ensure the button stays within bounds
            const buttonHeight = openSidebarButton.offsetHeight;
            const minY = 0;
            const maxY = viewportHeight - buttonHeight;

            // Constrain newY within the bounds
            const constrainedY = Math.max(minY, Math.min(maxY, newY));

            openSidebarButton.style.top = `${constrainedY}px`;
        }
    }

    function stopDragging() {
        isDragging = false;
        document.body.classList.remove('no-select');
    }

    // Mouse events for dragging
    openSidebarButton.addEventListener('mousedown', startDragging);
    document.addEventListener('mousemove', dragMove);
    document.addEventListener('mouseup', stopDragging);

    // Touch events for dragging
    openSidebarButton.addEventListener('touchstart', startDragging);
    document.addEventListener('touchmove', dragMove);
    document.addEventListener('touchend', stopDragging);
});
