function animateCSS(element, animationName, inf) {
    const node = document.querySelector(element)
    node.classList.add('animated', animationName)

    function handleAnimationEnd() {
        node.classList.remove('animated', animationName)
        node.removeEventListener('animationend', handleAnimationEnd)
    }

    if (!inf) {
        node.addEventListener('animationend', handleAnimationEnd)
    }

    if (inf) {
        node.classList.add('infinite');
    }
}

function unanimateCSS(element, animationName) {
    const node = document.querySelector(element)
    node.classList.remove('animated', animationName)
    node.classList.remove('infinite')
}

Vue.component('osubutton', {
    props: ['src'],
    data: function() {
        return {
            isClicked: false,
            isNotAnim: false,
        }
    },
    methods: {
        click: function() {
            this.isClicked = true;
            this.$emit("osubtnclicked");
        }
    },
    template: `
    <div id="logo-container" style="position: relative">
        <img v-bind:class="{noAnim: isNotAnim}" id="logo" @click="click" v-bind:src="src"></img>
    </div>
    `
})

Vue.component('osuoption', {
    props: ['filename', 'url'],
    data: function() {
        return {
            isOpen: false,
            isHovered: false
        }
    },
    methods: {
        toggleOption: function() {
            this.isOpen = !this.isOpen;
            console.log("Toggled option!");
        },
        mouseOver: function() {
            this.isHovered = true;
        },
        mouseLeave: function() {
            this.isHovered = false;
        }
    },
    // template: '<div v-bind:style="style" class="option" @mouseover="mouseOver" @mouseleave="mouseLeave"><span>{{title}}</span></div>'
    // template: '<div v-bind:class="{open: isOpen, hover: isHovered}" class="option" @mouseover="mouseOver" @mouseleave="mouseLeave"><img class="optionImage" v-bind:src="filename"/></div>'
    template: '<div v-bind:class="{open: isOpen, hover: isHovered}" class="option" @mouseover="mouseOver" @mouseleave="mouseLeave"><a class="optionImage" v-bind:href="url"><img class="optionImage" v-bind:src="filename"/></a></div> '
})

new Vue({
    el: "#osuButtonContainer",
    data: {
        src: "images/logo.png",
        options: [
            { filename: "images/menu-button-1.png", url: "/about" },
            { filename: "images/menu-button-2.png", url: "/members" },
            { filename: "images/menu-button-3.png", url: "/events" },
            { filename: "images/menu-button-4.png", url: "https://discord.gg/mfWqAFg" }
        ]
    },
    methods: {
        showOptions() {
            for (i = 0; i < Object.keys(this.$refs.optionsMenu).length; i++) {
                this.$refs.optionsMenu[i].toggleOption();
            }
        },
        clearOptions() {
            for (i = 0; i < Object.keys(this.$refs.optionsMenu).length; i++) {
                this.$refs.optionsMenu[i].toggleOption();
            }
        }
    }
})
