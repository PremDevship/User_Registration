import axios from 'axios'


const base_url = "http://localhost:3006/api/"

export async function PostApiusers(url,data){
    return axios.post(`${base_url}${url}`,data).then((res) => {
      return  res.data
    }).catch((error) => {
        console.log(error);
        return null;
    });
}

export async function Loginuser(url,data){
    return axios.post(`${base_url}${url}`,data).then((res) => {
      return  res.data
    }).catch((error) => {
        console.log(error);
        return null;
    });
}

export async function putAPI(url,data) {
    return axios.put(`${base_url}${url}`,data).then((res) => {
        return res.data
    }).catch((error) => {
        console.log(error);
        return null
    });
}

export async function GetApiusers(url){
    return axios({url:`${base_url}${url}`,method:'get',headers:{
        authorization: 'Bearer ' + localStorage.getItem('jwtoken')
    }}).then((res) => {
      return  res.data
    }).catch((error) => {
        console.log(error);
        return null;
    });
}

