var app = new Vue({
    el: '#app',
    mounted() {
        this.getdata();
    },
    data () {
        return {
            form: {
                targetuuid: 0,
                action: 'ADD',
                name: '',
                profession: '',
                password: ''
            },
            userList: []
        }
    },
    methods: {
        clearForm () {
            this.form = {
                targetuuid: 0,
                action: 'ADD',
                name: '',
                profession: '',
                password: ''
            }
        },
        getdata () {
            axios.get('/api/user')
            .then(response => {
                console.log(response);
                this.userList = response.data;
            })
        },
        editUser (userListIndex) {
            userListIndex = parseInt(userListIndex);
            this.form.action = 'UPDATE';
            this.form.targetuuid = this.userList[userListIndex].uuid;
            this.form.name = this.userList[userListIndex].name;
            this.form.profession = this.userList[userListIndex].profession;
            this.form.password = this.userList[userListIndex].password;
        },
        sendDelete (index) {
            index = parseInt(index);
            axios.delete('/api/user/' + this.userList[index].uuid, {})
                .then(response => {
                    this.getdata()
                },
                err => {
                    alert(err.statusText);
                });
        },
        sendForm () {
            switch(this.form.action){
                case 'UPDATE':
                    axios.put('/api/user/' + this.form.targetuuid, this.formObjectForSent)
                    .then(response => {
                        this.clearForm();
                        this.getdata();
                    },
                    err => {
                        alert(err.statusText);
                    });
                break;
                case 'ADD':
                    axios.post('/api/user/', this.formObjectForSent)
                    .then(response => {
                        this.clearForm();
                        this.getdata();
                    },
                    err => {
                        alert(err.statusText);
                    });
                break;
            }
        }
    },
    computed: {
        formObjectForSent () {
            return {
                name: this.form.name,
                profession: this.form.profession,
                password: this.form.password
            }
        }
    }
})