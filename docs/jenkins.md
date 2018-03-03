
### Install Jenkins on Kubernetes/minikube
```
$ kubectl apply -f k8s/volume/jenkins.yml
$ kubectl apply -f k8s/deployment/jenkins.yml
$ kubectl apply -f k8s/service/jenkins.yml
```

NOTES:
```
$ minikube ssh
$ sudo mkdir -p /k8s/data/jenkins
$ sudo chown 1000 /k8s/data/jenkins
```